import React, { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  UserRound,
  Building2,
  Lock,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthLayout } from "@/pages/auth/AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useAuthority } from "@/context/AuthorityContext";
import { useOfficer } from "@/context/OfficerContext";
import { mockAuthorities } from "@/data/authority/mockAuthorities";
import { mockOfficerCredential } from "@/data/officer/mockOfficerTasks";

export default function Login() {
  const navigate = useNavigate();
  const { login, role } = useAuth();
  const { loginAuthority } = useAuthority();
  const { loginOfficer } = useOfficer();

  // State for the authority / officer login forms.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // When the "authority" preview role is active, show the authority login form.
  const isAuthorityRole = role === "authority";
  // When the "officer" preview role is active, show the officer login form.
  const isOfficerRole = role === "officer";

  const handleQuickFill = (auth) => {
    setEmail(auth.email);
    setPassword(auth.password);
  };

  const handleQuickFillOfficer = () => {
    setEmail(mockOfficerCredential.email);
    setPassword(mockOfficerCredential.password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (isAuthorityRole) {
      // Simulated authority authentication.
      setTimeout(() => {
        const result = loginAuthority(email, password);
        if (result.success) {
          toast.success(`Welcome, ${result.authority.authorityName}!`, {
            duration: 4000,
          });
          navigate("/authority/dashboard");
        } else {
          toast.error(result.message);
        }
        setLoading(false);
      }, 600);
      return;
    }

    if (isOfficerRole) {
      // Simulated officer authentication.
      setTimeout(() => {
        const result = loginOfficer(email, password);
        if (result.success) {
          toast.success(`Welcome, ${result.officer.name}!`, {
            duration: 4000,
          });
          navigate("/officer/overview");
        } else {
          toast.error(result.message);
        }
        setLoading(false);
      }, 600);
      return;
    }

    // Default citizen/admin flow.
    login();
    if (role === "admin") {
      toast.success("Welcome back, Administrator!", {
        duration: 4000,
      });
      navigate("/admin/dashboard");
    } else {
      toast.success("Welcome back! Signed in successfully.", {
        duration: 4000,
      });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      {/*Mobile-only header logo*/}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-lg font-bold text-indigo-600 lg:hidden mb-4">
          <ShieldCheck className="h-6 w-6" /> Civic Link
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {isAuthorityRole
            ? "Authority Sign In"
            : isOfficerRole
              ? "Officer Sign In"
              : "Welcome back"}
        </h2>
        <p className="text-xs text-slate-500">
          {isAuthorityRole
            ? "Sign in to access your authority workspace."
            : isOfficerRole
              ? "Sign in to access your officer workspace."
              : "Sign in to continue to your workspace."}
        </p>
      </div>

      {isAuthorityRole || isOfficerRole ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                {isAuthorityRole ? "Authority Email" : "Officer Email"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    isAuthorityRole
                      ? "authority@civiclink.com"
                      : "officer@civiclink.com"
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              full
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Button>
          </form>

          {/* Sample credentials */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Sample login credentials
            </p>
            <div className="space-y-2">
              {isAuthorityRole ? (
                mockAuthorities.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleQuickFill(a)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                      {a.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {a.email} · {a.password}
                    </span>
                  </button>
                ))
              ) : (
                <button
                  onClick={handleQuickFillOfficer}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <UserRound className="h-3.5 w-3.5 text-indigo-500" />
                    {mockOfficerCredential.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {mockOfficerCredential.email} ·{" "}
                    {mockOfficerCredential.password}
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={<UserRound className="h-4 w-4" />}
            />

            <FormField
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<ShieldCheck className="h-4 w-4" />}
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
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Button
              type="submit"
              full
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.99] cursor-pointer"
            >
              Sign in
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Button>
          </form>
          <p className="text-center text-xs text-slate-500">
            New to Civic Link?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Create an account
            </button>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
