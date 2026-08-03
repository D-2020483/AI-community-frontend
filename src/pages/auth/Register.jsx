import React from "react";
import { Activity, ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/pages/auth/AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e?.preventDefault();
    login();
    navigate("/login");
  };

  return (
    <AuthLayout>
      {/* Mobile-only Header Logo */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-lg font-bold text-indigo-600 lg:hidden mb-4">
          <ShieldCheck className="h-6 w-6" /> Civic Link
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="text-xs text-slate-500">
          Join your neighbors in making a difference.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <FormField
          label="Full name"
          placeholder="Enter your full name"
          icon={<UserRound className="h-4 w-4" />}
        />

        <FormField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<UserRound className="h-4 w-4" />}
        />

        <FormField
          label="Phone number"
          placeholder="(555) 000-0000"
          icon={<Activity className="h-4 w-4" />}
        />

        <FormField
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<ShieldCheck className="h-4 w-4" />}
        />

        <FormField
          label="Confirm password"
          type="password"
          placeholder="Confirm your password"
          icon={<ShieldCheck className="h-4 w-4" />}
        />

        <Button
          type="submit"
          full
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.99] cursor-pointer"
        >
          Create account
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}
