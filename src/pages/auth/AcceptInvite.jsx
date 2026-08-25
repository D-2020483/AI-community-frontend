import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/pages/auth/AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { getRouteForRole, mapBackendRole } from "@/lib/auth";

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest(`/auth/invite/${token}`)
      .then((data) => setInvite(data.data.invite))
      .catch((error) => {
        toast.error(getErrorMessage(error.data, error.message));
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = await apiRequest("/auth/accept-invite", {
        method: "POST",
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      toast.success(data.message || "Invitation accepted!");
      const nextRole = mapBackendRole(invite.role);
      navigate(nextRole && nextRole !== "citizen" ? `/login?role=${nextRole}` : "/login");
    } catch (error) {
      toast.error(getErrorMessage(error.data, error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <p className="text-sm text-slate-500">Loading invitation…</p>
      </AuthLayout>
    );
  }

  if (!token || !invite) {
    return (
      <AuthLayout>
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">Invalid invitation</h2>
          <p className="text-sm text-slate-500">
            This invitation link is invalid or has expired.
          </p>
          <Button onClick={() => navigate("/login")}>Go to login</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-lg font-bold text-indigo-600 lg:hidden mb-4">
          <ShieldCheck className="h-6 w-6" /> Civic Link
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Accept your invitation
        </h2>
        <p className="text-xs text-slate-500">
          Welcome, {invite.fullName}. Set a password for {invite.email} to activate
          your {mapBackendRole(invite.role)} account
          {invite.authorityName ? ` under ${invite.authorityName}` : ""}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          icon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FormField
          label="Confirm password"
          type="password"
          placeholder="Confirm your password"
          icon={<Lock className="h-4 w-4" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" full disabled={submitting}>
          {submitting ? "Saving…" : "Activate account"}
          {!submitting && <ArrowRight className="h-4 w-4 stroke-[2.5]" />}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Already activated?{" "}
        <button
          onClick={() => navigate("/login")}
          className="font-semibold text-indigo-600 hover:underline"
        >
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}
