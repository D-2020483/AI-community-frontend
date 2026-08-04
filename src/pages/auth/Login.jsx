import React from "react";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthLayout } from "@/pages/auth/AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, role } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
    // Route to the appropriate workspace based on the selected preview role
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
  };

  return (
    <AuthLayout>
      {/*Mobile-only header logo*/}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-lg font-bold text-indigo-600 lg:hidden mb-4">
          <ShieldCheck className="h-6 w-6" /> Civic Link
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="text-xs text-slate-500">
          Sign in to continue to your workspace.
        </p>
      </div>

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
    </AuthLayout>
  );
}
