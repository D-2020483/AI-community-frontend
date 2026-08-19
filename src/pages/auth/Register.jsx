import React, { useState } from "react";
import { Activity, ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthLayout } from "@/pages/auth/AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/Button";
import { apiRequest, getErrorMessage } from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success("Account created successfully! Please sign in.");
      navigate("/login");
    } catch (error) {
      toast.error(
        getErrorMessage(error.data, error.message || "Registration failed"),
      );
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
          Create your account
        </h2>
        <p className="text-xs text-slate-500">
          Join your neighbors in making a difference.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <FormField
          name="fullName"
          label="Full name"
          placeholder="Enter your full name"
          icon={<UserRound className="h-4 w-4" />}
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <FormField
          name="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<UserRound className="h-4 w-4" />}
          value={formData.email}
          onChange={handleChange}
          required
        />

        <FormField
          name="phone"
          label="Phone number"
          placeholder="(555) 000-0000"
          icon={<Activity className="h-4 w-4" />}
          value={formData.phone}
          onChange={handleChange}
        />

        <FormField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<ShieldCheck className="h-4 w-4" />}
          value={formData.password}
          onChange={handleChange}
          required
        />

        <FormField
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Confirm your password"
          icon={<ShieldCheck className="h-4 w-4" />}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          full
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create account"}
          {!loading && <ArrowRight className="h-4 w-4 stroke-[2.5]" />}
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
