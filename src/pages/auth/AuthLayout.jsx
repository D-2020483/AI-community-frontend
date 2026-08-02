import React from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { servicePhoto } from "@/data/mockData";

const previewRoles = ["citizen", "authority", "officer", "admin"];

export function AuthLayout({ children }) {
  const { role } = useAuth();

  return (
    <main className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-900">
      {/*Left Brand Side - Hidden on Mobile*/}
      <section className="relative hidden w-1/2 flex-col justify-between bg-linear-to-br from-blue-700 via-blue-600 to-sky-500 p-10 text-white lg:flex xl:p-14">
        {/*Brand header */}
        <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
            <ShieldCheck className="h-5 w-5 text-white" />
          </span>
          Civic<span className="opacity-90 text-blue-400 font-bold">Link</span>
        </div>

        {/*Hero pitch*/}
        <div className="my-auto max-w-max space-y-6 mt-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-medium backdrop-blur-md border border-white/10">
            <Sparkles className="h-3.5 w-3.5 " />
            Powered by civic AI
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Make your community
            <br />
            <i className="font-serif italic font-normal text-blue-200">
              better, together.
            </i>
          </h1>
          <p className="text-sm font-normal text-blue-100/90 leading-relaxed">
            Report local issues, follow progress, and see the change your
            community is making.
          </p>

          {/*Visual card display*/}
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/20 bg-slate-900/40 shadow-2xl backdrop-blur-sm">
            <img
              src={servicePhoto}
              alt="Municipal workers caring for a community street"
              className="h-64 w-full object-cover grayscale brightness-90 contrast-125"
            />
            <div className="absolute bottom-4 left-4 rounded-xl border border-white/20 bg-white/90 p-4 text-slate-900 shadow-xl backdrop-blur-md max-w-220px">
              <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase block">
                Issues resolved this month
              </span>
              <b className="text-2xl font-black text-slate-900 block my-0.5">
                1,284
              </b>
              <small className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <ArrowRight className="h-3.5 w-3.5" /> 18% from last month
              </small>
            </div>
          </div>
        </div>
        {/* Footer Copyright */}
        <div className="text-xs text-blue-100/70 mt-auto pt-8">
          © 2026 Civic Link Community Services
        </div>
      </section>

      {/*Right Content Area*/}
      <section className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          {/* Role Preview Bar */}
          <div className="flex items-center justify-between rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-500">
            <span className="px-3 text-slate-400">Preview</span>
            <div className="flex gap-1">
              {previewRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-lg px-3 py-1.5 capitalize transition-all ${
                    role === r
                      ? "bg-white font-semibold text-blue-600 shadow-sm"
                      : "hover:text-slate-900"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {/* Form Content */}
          <div className="space-y-5">{children}</div>
        </div>
      </section>
    </main>
  );
}
