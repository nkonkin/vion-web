"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Releases() {
  const releases = useQuery(api.releases.list);

  return (
    <section id="music" className="border-t border-border px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-5xl">
        <p className="font-display text-[0.7rem] uppercase tracking-[0.45em] text-muted">
          Music
        </p>

        <ul className="mt-12 divide-y divide-border">
          {releases === undefined && (
            <li className="py-8 text-muted">Loading releases…</li>
          )}
          {releases?.length === 0 && (
            <li className="py-8 text-muted">No releases yet.</li>
          )}
          {releases?.map((release) => (
            <li key={release._id} className="group py-8">
              <a
                href={release.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end"
              >
                <div>
                  <h3 className="font-display text-[clamp(1.75rem,4vw,3rem)] uppercase leading-none tracking-[0.04em] transition-opacity duration-300 group-hover:opacity-60">
                    {release.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted">{release.artists}</p>
                </div>
                <span className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-muted transition-colors duration-300 group-hover:text-foreground">
                  Listen ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Shows() {
  const today = new Date().toISOString().slice(0, 10);
  const shows = useQuery(api.shows.listUpcoming, { today });

  return (
    <section id="tour" className="border-t border-border px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-5xl">
        <p className="font-display text-[0.7rem] uppercase tracking-[0.45em] text-muted">
          Tour
        </p>

        <ul className="mt-12 divide-y divide-border">
          {shows === undefined && (
            <li className="py-8 text-muted">Loading dates…</li>
          )}
          {shows?.length === 0 && (
            <li className="py-8 text-muted">No upcoming shows.</li>
          )}
          {shows?.map((show) => (
            <li key={show._id} className="group py-6">
              <div className="grid gap-4 md:grid-cols-[10rem_1fr_auto] md:items-center">
                <p className="font-display text-sm uppercase tracking-[0.2em] text-muted">
                  {formatDate(show.date)}
                </p>
                <div>
                  <p className="text-base md:text-lg">{show.venue}</p>
                  <p className="mt-1 text-sm text-muted">
                    {show.city}, {show.country}
                  </p>
                </div>
                <div className="md:text-right">
                  {show.soldOut ? (
                    <span className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-muted">
                      Sold out
                    </span>
                  ) : show.ticketUrl ? (
                    <a
                      href={show.ticketUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-foreground transition-opacity duration-300 hover:opacity-60"
                    >
                      Tickets ↗
                    </a>
                  ) : (
                    <span className="font-display text-[0.65rem] uppercase tracking-[0.35em] text-muted">
                      TBA
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
