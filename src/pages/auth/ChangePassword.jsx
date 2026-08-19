import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/pages/auth/AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { getRouteForRole } from "@/lib/auth";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { changePassword, role, isAuthenticated, isLoading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && !isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success("Password updated successfully");
      navigate(getRouteForRole(role), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error.data, error.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-lg font-bold text-indigo-600 lg:hidden mb-4">
          <ShieldCheck className="h-6 w-6" /> Civic Link
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Set your new password
        </h2>
        <p className="text-xs text-slate-500">
          You signed in with a temporary password. Choose a new password to
          continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Current password"
          type="password"
          placeholder="Temporary password from your invite email"
          icon={<Lock className="h-4 w-4" />}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <FormField
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          icon={<Lock className="h-4 w-4" />}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <FormField
          label="Confirm new password"
          type="password"
          placeholder="Confirm your new password"
          icon={<Lock className="h-4 w-4" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" full disabled={submitting}>
          {submitting ? "Saving…" : "Update password"}
          {!submitting && <ArrowRight className="h-4 w-4 stroke-[2.5]" />}
        </Button>
      </form>
    </AuthLayout>
  );
}
