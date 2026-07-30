"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function LivesetsPanel({
  selectedId,
  onSelect,
}: {
  selectedId: Id<"livesets"> | null;
  onSelect: (id: Id<"livesets">) => void;
}) {
  const livesets = useQuery(api.livesets.list);
  const activeId = selectedId ?? livesets?.[0]?._id ?? null;

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <ul>
        {livesets === undefined && (
          <li className="label px-4 py-3 text-muted">Loading</li>
        )}
        {livesets?.length === 0 && (
          <li className="label px-4 py-6 text-muted">No livesets yet</li>
        )}
        {livesets?.map((liveset) => {
          const active = activeId === liveset._id;
          const meta = [liveset.city, liveset.venue].filter(Boolean).join(" · ");

          return (
            <li
              key={liveset._id}
              className={`flex items-baseline border-b border-border transition-colors duration-200 ${
                active
                  ? "bg-foreground text-background"
                  : "hover:bg-foreground hover:text-background"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(liveset._id)}
                className="flex min-w-0 flex-1 items-baseline gap-4 px-4 py-2.5 text-left"
              >
                <span className="label w-10 shrink-0 opacity-55">
                  {liveset.recordedAt.startsWith("1970")
                    ? "—"
                    : liveset.recordedAt.slice(0, 4)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="title-row block truncate text-[length:var(--copy)]">
                    {liveset.title}
                  </span>
                  {meta && (
                    <span className="title-row mt-0.5 block truncate text-[0.75rem] opacity-55">
                      {meta}
                    </span>
                  )}
                </span>
              </button>
              <a
                href={liveset.url}
                target="_blank"
                rel="noreferrer"
                className="site-link shrink-0 px-4 py-2.5"
                onClick={(e) => e.stopPropagation()}
              >
                Play
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
