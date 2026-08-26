import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ResponsiveSidebar } from "@/layouts/citizen/ResponsiveSidebar";
import { HeaderNavbar } from "@/layouts/citizen/HeaderNavbar";
import { TellUs } from "@/pages/report/TellUs";
import { SetLocation } from "@/pages/report/SetLocation";
import { AIAnalysisResult } from "@/pages/report/AIAnalysisResult";
import { useNavigate } from "react-router-dom";
import { analyzeReport, isAbortError } from "@/lib/aiService";
import { labelForCategory, useIssueCategories } from "@/lib/categoryService";
import {
  fileToDataUrl,
  saveTrackedReport,
  toStoredImageUrl,
} from "@/lib/reportService";
import { isValidCoordPair } from "@/lib/actionState";

const PROCESS_IDLE = "idle";
const PROCESS_SUBMITTING = "submitting";
const PROCESS_ANALYZING = "analyzing";
const PROCESS_COMPLETED = "completed";

export default function ReportIssue() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { options: categoryOptions } = useIssueCategories();

  //from state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  //AI state / submission status
  const [processState, setProcessState] = useState(PROCESS_IDLE);
  const [submitError, setSubmitError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  const isBusy =
    processState === PROCESS_SUBMITTING || processState === PROCESS_ANALYZING;
  const isSubmitted =
    processState === PROCESS_COMPLETED && Boolean(aiResult);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleImageChange = (file) => {
    if (isBusy) return;
    setImageFile(file);

    setImagePreviewUrl((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
      return file ? URL.createObjectURL(file) : null;
    });
  };
  const canSubmit = Boolean(
    imageFile &&
      description.trim() &&
      locationConfirmed &&
      location.trim() &&
      isValidCoordPair(coords?.lat, coords?.lng) &&
      processState === PROCESS_IDLE,
  );

  const isCurrentRequest = (requestId) =>
    requestId === requestIdRef.current && !abortRef.current?.signal?.aborted;

  const resetCancelledUi = () => {
    setAiResult(null);
    setSubmitError(null);
    setProcessState(PROCESS_IDLE);
  };

  const handleStop = () => {
    if (!isBusy) return;
    requestIdRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    toast.dismiss("report-submitted");
    resetCancelledUi();
  };

  // submit report to AI service
  const handleSubmit = async () => {
    if (!canSubmit || isBusy) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    abortRef.current = controller;

    setSubmitError(null);
    setAiResult(null);
    setProcessState(PROCESS_SUBMITTING);
    let completed = false;

    try {
      setProcessState(PROCESS_ANALYZING);
      const result = await analyzeReport({
        file: imageFile,
        category: null,
        description,
        location,
        signal: controller.signal,
      });

      if (!isCurrentRequest(requestId)) return;

      setProcessState(PROCESS_SUBMITTING);

      try {
        const imageDataUrl = imageFile
          ? toStoredImageUrl(await fileToDataUrl(imageFile))
          : null;

        if (!isCurrentRequest(requestId)) return;

        await saveTrackedReport(
          {
            reportId: result.report_id,
            description,
            location,
            locationName: location,
            latitude: coords.lat,
            longitude: coords.lng,
            lat: coords.lat,
            lng: coords.lng,
            imageUrl: imageDataUrl,
            category: result.issue_category,
            authority: result.assigned_authority?.name || "Relevant Authority",
            detectedIssue: result.detected_issue,
            priority: result.priority,
            confidence: result.confidence,
            reason: result.reason,
            status: "ASSIGNED",
          },
          { signal: controller.signal },
        );
      } catch (saveErr) {
        if (!isCurrentRequest(requestId) || isAbortError(saveErr)) return;
        console.error("Failed to save report:", saveErr);
        toast.error(
          saveErr?.message ||
            "AI analysis succeeded, but the report could not be saved for tracking.",
        );
      }

      if (!isCurrentRequest(requestId)) return;

      completed = true;
      setAiResult(result);
      setProcessState(PROCESS_COMPLETED);

      toast.success("Report submitted successfully! AI analysis complete.", {
        id: "report-submitted",
      });
    } catch (err) {
      if (!isCurrentRequest(requestId) || isAbortError(err)) return;

      console.error("AI analysis error:", err);

      const errorMessage = err?.message || "Failed to analyze the report.";

      setSubmitError(errorMessage);
      setProcessState(PROCESS_IDLE);
      toast.error(errorMessage);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      if (!completed && requestId === requestIdRef.current) {
        setProcessState(PROCESS_IDLE);
      }
    }
  };

  //track report
  const handleTrackReport = async (edited) => {
    if (!aiResult) return;

    toast("Opening the live tracker for your report…");

    const category = edited?.category || aiResult.issue_category;
    const authority =
      edited?.authority ||
      aiResult.assigned_authority?.name ||
      "Relevant Authority";

    try {
      const imageDataUrl = imageFile
        ? toStoredImageUrl(await fileToDataUrl(imageFile))
        : null;

      await saveTrackedReport({
        reportId: aiResult.report_id,
        description,
        location,
        locationName: location,
        latitude: coords?.lat,
        longitude: coords?.lng,
        lat: coords?.lat,
        lng: coords?.lng,
        imageUrl: imageDataUrl,
        category,
        authority,
        detectedIssue: aiResult.detected_issue,
        priority: aiResult.priority,
        confidence: aiResult.confidence,
        reason: aiResult.reason,
        status: "ASSIGNED",
      });
    } catch (saveErr) {
      console.error("Failed to save report before tracking:", saveErr);
    }

    navigate(`/track-report/${aiResult.report_id}`, {
      state: {
        report: {
          id: aiResult.report_id,
          title: aiResult.detected_issue,
          description,
          location,
          category: labelForCategory(category, categoryOptions),
          confidence: `${Math.round(aiResult.confidence * 100)}%`,
          authority,
          priority: aiResult.priority
            ? aiResult.priority.charAt(0) +
              aiResult.priority.slice(1).toLowerCase()
            : "Medium",
          status: "Assigned",
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          imageUrl: imagePreviewUrl,
        },
      },
    });
  };
  // determine which view to show based on AI analysis status
  //UI
  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans">
      {/* Sidebar Navigation */}
      <ResponsiveSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigation Bar - Header updates based on view state */}
        <HeaderNavbar
          title={isSubmitted ? "AI analysis result" : "Report an issue"}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        {/* Content View Container */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {!isSubmitted ? (
            <>
              {/* Main Title Section */}
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Report an issue
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Help us identify and resolve problems in your neighborhood.
                </p>
              </div>

              {/* Grid Layout: Stacked on mobile, 2 Equal Height Columns on Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="animate-slide-up h-full flex flex-col">
                  <TellUs
                    imageFile={imageFile}
                    imagePreviewUrl={imagePreviewUrl}
                    onImageChange={handleImageChange}
                    description={description}
                    onDescriptionChange={setDescription}
                    disabled={isBusy}
                  />
                </div>
                <div
                  className="animate-slide-up h-full flex flex-col"
                  style={{ animationDelay: "100ms" }}
                >
                  <SetLocation
                    location={location}
                    onLocationChange={setLocation}
                    coords={coords}
                    onCoordsChange={setCoords}
                    locationConfirmed={locationConfirmed}
                    onLocationConfirmed={setLocationConfirmed}
                    onSubmit={handleSubmit}
                    onStop={handleStop}
                    processState={processState}
                    submitting={isBusy}
                    canSubmit={canSubmit}
                    error={submitError}
                  />
                </div>
              </div>
            </>
          ) : (
            /* AI Analysis Screen View */
            <AIAnalysisResult
              aiResult={aiResult}
              description={description}
              location={location}
              imagePreviewUrl={imagePreviewUrl}
              onTrackReport={handleTrackReport}
              categoryOptions={categoryOptions}
            />
          )}
        </main>
      </div>
    </div>
  );
}
