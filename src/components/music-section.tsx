"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function MusicPanel({
  selectedId,
  onSelect,
}: {
  selectedId: Id<"releases"> | null;
  onSelect: (id: Id<"releases">) => void;
}) {
  const releases = useQuery(api.releases.list);
  const activeId = selectedId ?? releases?.[0]?._id ?? null;

  return (
    <div className="h-full min-h-0 min-w-0 overflow-x-hidden overflow-y-auto">
      <ul className="min-w-0">
        {releases === undefined && (
          <li className="label px-4 py-3 text-muted">Loading</li>
        )}
        {releases?.map((release) => {
          const active = activeId === release._id;
          return (
            <li
              key={release._id}
              className={`flex min-w-0 items-baseline border-b border-border transition-colors duration-200 ${
                active
                  ? "bg-foreground text-background"
                  : "hover:bg-foreground hover:text-background"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(release._id)}
                className="flex min-w-0 flex-1 items-baseline gap-3 overflow-hidden px-3 py-2 text-left md:gap-4 md:px-4 md:py-2.5"
              >
                <span className="label w-9 shrink-0 opacity-55 md:w-10">
                  {release.releasedAt.slice(0, 4)}
                </span>
                <span className="title-row min-w-0 flex-1 truncate text-[length:var(--copy)]">
                  {release.title}
                </span>
              </button>
              <a
                href={release.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="site-link shrink-0 px-3 py-2 md:px-4 md:py-2.5"
                onClick={(e) => e.stopPropagation()}
              >
                Listen
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
