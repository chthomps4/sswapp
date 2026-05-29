"use client";

import { useState } from "react";

const statuses = ["reviewed", "accepted", "in_progress", "resolved", "ignored"] as const;

export function WorkflowGapActions({ gapId }: { gapId: string }) {
  const [pending, setPending] = useState("");

  async function setStatus(status: string) {
    setPending(status);
    const response = await fetch(`/api/workflow-gaps/${gapId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPending("");
    if (response.ok) window.location.reload();
  }

  return (
    <div className="flex flex-wrap gap-1">
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => setStatus(status)}
          disabled={Boolean(pending)}
          className="rounded border border-stone-200 bg-white px-2 py-1 text-xs hover:border-emerald-300 disabled:opacity-60"
        >
          {pending === status ? "..." : status.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}
