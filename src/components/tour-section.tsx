"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function formatShowDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TourPanel({
  today,
  nextShowLabel,
}: {
  today: string;
  nextShowLabel?: string | null;
}) {
  const shows = useQuery(api.shows.listAll, { today });

  return (
    <div className="flex h-full min-h-0 flex-col">
      {nextShowLabel && (
        <p className="label shrink-0 border-b border-border px-4 py-3 md:hidden">
          {nextShowLabel}
        </p>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ul>
          {shows === undefined && (
            <li className="label px-4 py-3 text-muted">Loading</li>
          )}
          {shows?.length === 0 && (
            <li className="label px-4 py-6 text-muted">No dates announced</li>
          )}
          {shows?.map((show) => {
            const past = show.date < today;
            return (
              <li
                key={show._id}
                className={`grid grid-cols-[7.5rem_1fr_auto] items-baseline gap-3 border-b border-border px-4 py-2.5 md:grid-cols-[9rem_1fr_1fr_5rem] ${
                  past ? "text-muted line-through" : ""
                }`}
              >
                <span className="label">{formatShowDate(show.date)}</span>
                <span className="title-row truncate">{show.city}</span>
                <span className="title-row hidden truncate text-muted md:inline">
                  {show.venue}
                </span>
                <span className="text-right">
                  {show.soldOut ? (
                    <span className="label">Sold out</span>
                  ) : show.ticketUrl && !past ? (
                    <a
                      href={show.ticketUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="site-link"
                    >
                      Tickets
                    </a>
                  ) : (
                    <span className="label text-muted">—</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
