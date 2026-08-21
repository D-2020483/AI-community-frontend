import React from "react";
import { Modal } from "@/components/ui/Modal";

export function CreatedCredentialsModal({
  credentials,
  onClose,
  roleLabel = "officer",
}) {
  return (
    <Modal
      open={!!credentials}
      onClose={onClose}
      title={`${roleLabel === "authority" ? "Authority" : "Officer"} login details`}
      subtitle={
        credentials?.emailSent
          ? "These details were also emailed to the official address"
          : "Email was not sent. Copy these details and share them securely"
      }
      size="md"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
        >
          Done
        </button>
      }
    >
      {credentials && (
        <div className="space-y-3 text-sm">
          <p className="text-xs text-slate-500">
            {credentials.name} can sign in to the {roleLabel} workspace with:
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <p>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Login / invite link
              </span>
              <br />
              {credentials.loginUrl ? (
                <a
                  href={credentials.loginUrl}
                  className="text-indigo-600 font-semibold break-all"
                  target="_blank"
                  rel="noreferrer"
                >
                  {credentials.loginUrl}
                </a>
              ) : (
                <span className="font-semibold text-slate-800">—</span>
              )}
            </p>
            <p>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Official email
              </span>
              <br />
              <span className="font-semibold text-slate-800">
                {credentials.email}
              </span>
            </p>
            <p>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Password
              </span>
              <br />
              <span className="font-mono font-semibold text-indigo-700">
                {credentials.password}
              </span>
            </p>
          </div>
          {credentials.emailMessage && (
            <p className="text-[11px] text-slate-500">
              {credentials.emailMessage}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
