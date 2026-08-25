import React, { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { toCurrentOriginUrl } from "@/lib/auth";

export function CreatedCredentialsModal({
  credentials,
  onClose,
  roleLabel = "officer",
}) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = useMemo(
    () => toCurrentOriginUrl(credentials?.loginUrl),
    [credentials?.loginUrl],
  );

  const copyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const workspaceLabel = roleLabel === "authority" ? "authority" : "officer";

  return (
    <Modal
      open={!!credentials}
      onClose={onClose}
      title="Invitation link"
      subtitle={
        credentials?.emailSent
          ? "Share this one-time link. It was also emailed to the official address"
          : "Email was not sent. Copy this one-time invitation link and share it securely"
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
            {credentials.name} opens this one-time invitation link, sets a
            password, then signs in to the {workspaceLabel} workspace.
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Invitation link
              </span>
              <div className="mt-1 flex items-start gap-2">
                {inviteUrl ? (
                  <a
                    href={inviteUrl}
                    className="text-indigo-600 font-semibold break-all flex-1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {inviteUrl}
                  </a>
                ) : (
                  <span className="font-semibold text-slate-800">—</span>
                )}
                {inviteUrl && (
                  <button
                    type="button"
                    onClick={copyInvite}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase text-indigo-700 bg-white border border-indigo-100 rounded-lg hover:bg-indigo-50 cursor-pointer"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
            </div>
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
