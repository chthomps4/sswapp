"use client";

import { useState } from "react";

export function WorkflowAuditRunButton({ label = "Run audit" }: { label?: string }) {
  const [state, setState] = useState<"idle" | "running" | "failed">("idle");
  const [message, setMessage] = useState("");

  async function runAudit() {
    setState("running");
    setMessage("");
    const response = await fetch("/api/workflow-audits/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = (await response.json().catch(() => ({}))) as { auditId?: string; message?: string };
    if (!response.ok || !data.auditId) {
      setState("failed");
      setMessage(data.message || "Workflow audit failed.");
      return;
    }
    window.location.href = `/workflow-audits/${data.auditId}`;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={runAudit}
        disabled={state === "running"}
        className="inline-flex items-center justify-center rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white hover:bg-[#195a41] disabled:cursor-wait disabled:opacity-70"
      >
        {state === "running" ? "Running..." : label}
      </button>
      {message ? <p className="text-xs text-red-700">{message}</p> : null}
    </div>
  );
}
