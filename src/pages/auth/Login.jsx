import React, { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, UserRound, Lock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthLayout } from "@/pages/auth/AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { getRouteForRole, mapBackendRole } from "@/lib/auth";

const LOGIN_ROLES = ["citizen", "authority", "officer", "admin"];

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, role, setRole, isAuthenticated, isLoading } = useAuth();

  const inviteFromLink = searchParams.get("invite") || "";
  const roleFromLink = searchParams.get("role") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteUsed, setInviteUsed] = useState(false);
  const [inviteValid, setInviteValid] = useState(Boolean(inviteFromLink));

  const roleLabel =
    role === "admin"
      ? "Administrator"
      : role === "authority"
        ? "Authority"
        : role === "officer"
          ? "Officer"
          : "Citizen";

  useEffect(() => {
    if (LOGIN_ROLES.includes(roleFromLink) && roleFromLink !== role) {
      setRole(roleFromLink);
    }
  }, [roleFromLink, role, setRole]);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      navigate(getRouteForRole(role), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, role]);

  useEffect(() => {
    if (!inviteFromLink) {
      setInviteValid(false);
      setInviteUsed(false);
      return;
    }

    let cancelled = false;
    apiRequest(`/auth/login-invite/${inviteFromLink}`)
      .then((data) => {
        if (cancelled) return;
        const invite = data.data?.invite;
        if (invite?.email) setEmail(invite.email);
        if (invite?.role) setRole(mapBackendRole(invite.role));
        setInviteValid(true);
        setInviteUsed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setInviteValid(false);
        setInviteUsed(true);
        toast.error(
          getErrorMessage(
            error.data,
            "This login link has already been used. Select your role and sign in.",
          ),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [inviteFromLink, setRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password, {
        expectedRole: role,
        inviteToken: inviteUsed ? undefined : inviteFromLink || undefined,
      });
      toast.success(
        result.requiresPasswordChange
          ? "Please set a new password to continue."
          : `Welcome back${result.user.fullName ? `, ${result.user.fullName}` : ""}!`,
        { duration: 4000 },
      );
      navigate(result.route, { replace: true });
    } catch (error) {
      toast.error(error.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-lg font-bold text-indigo-600 lg:hidden mb-4">
          <ShieldCheck className="h-6 w-6" /> Civic Link
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {roleLabel} sign in
        </h2>
        <p className="text-xs text-slate-500">
          Select your role above, then sign in with your official email and
          password.
        </p>
      </div>

      {inviteUsed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          This emailed login link has already been used. Select{" "}
          <strong>Authority</strong> or <strong>Officer</strong> above and sign
          in with your email and password.
        </div>
      )}

      {inviteValid && !inviteUsed && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
          {roleLabel} is selected. Enter the password from your email to
          continue. This link can be used only once.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          name="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<UserRound className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FormField
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          icon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>

        <Button
          type="submit"
          full
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.99] cursor-pointer disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </Button>
      </form>

      {role === "citizen" && (
        <p className="text-center text-xs text-slate-500">
          New to Civic Link?{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Create an account
          </button>
        </p>
      )}
    </AuthLayout>
  );
}
