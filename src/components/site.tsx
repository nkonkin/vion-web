"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ContactPanel } from "./contact-section";
import { LinksPanel } from "./links-panel";
import { LivesetsPanel } from "./livesets-panel";
import { MusicPanel } from "./music-section";
import { SiteNav, type Panel } from "./site-nav";
import { TourPanel } from "./tour-section";

function useCountdown(targetDate: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) return null;

  const target = new Date(`${targetDate}T21:00:00`).getTime();
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function MediaPane({
  src,
  alt,
  isPress,
}: {
  src: string;
  alt: string;
  isPress?: boolean;
}) {
  const [base, setBase] = useState({ src, alt, isPress });
  const [overlay, setOverlay] = useState<{
    src: string;
    alt: string;
    isPress?: boolean;
  } | null>(null);
  const [overlayOpaque, setOverlayOpaque] = useState(false);
  const overlaySrc = overlay?.src ?? null;

  useEffect(() => {
    const showing = overlaySrc ?? base.src;

    if (src === showing) {
      if (overlaySrc) {
        setOverlay((prev) =>
          prev ? { ...prev, alt, isPress } : prev,
        );
      } else {
        setBase((prev) => ({ ...prev, alt, isPress }));
      }
      return;
    }

    if (src === base.src && overlaySrc) {
      setOverlay(null);
      setOverlayOpaque(false);
      setBase({ src, alt, isPress });
      return;
    }

    setOverlay({ src, alt, isPress });
    setOverlayOpaque(false);
  }, [src, alt, isPress, base.src, overlaySrc]);

  function finishCrossfade() {
    if (!overlay || !overlayOpaque) return;
    setBase(overlay);
    setOverlay(null);
    setOverlayOpaque(false);
  }

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-background">
      <MediaLayer
        src={base.src}
        alt={overlay ? "" : base.alt}
        isPress={base.isPress}
        opaque
        priority
      />
      {overlay && (
        <MediaLayer
          src={overlay.src}
          alt={overlay.alt}
          isPress={overlay.isPress}
          opaque={overlayOpaque}
          priority
          onReady={() => setOverlayOpaque(true)}
          onFadeEnd={finishCrossfade}
        />
      )}
    </div>
  );
}

function MediaLayer({
  src,
  alt,
  isPress,
  opaque,
  priority,
  onReady,
  onFadeEnd,
}: {
  src: string;
  alt: string;
  isPress?: boolean;
  opaque: boolean;
  priority?: boolean;
  onReady?: () => void;
  onFadeEnd?: () => void;
}) {
  const isLocal = src.startsWith("/");

  return (
    <div
      className={`media-crossfade absolute inset-0 ${
        opaque ? "opacity-100" : "opacity-0"
      }`}
      onTransitionEnd={(event) => {
        if (event.propertyName !== "opacity") return;
        if (opaque) onFadeEnd?.();
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        quality={100}
        unoptimized={isLocal}
        priority={priority}
        onLoad={() => {
            // Paint opacity-0 first, then transition to 100
            requestAnimationFrame(() => {
              requestAnimationFrame(() => onReady?.());
            });
          }}
        className={`object-cover ${
          isPress ? "object-[center_18%]" : "object-center"
        }`}
        sizes="(max-width: 768px) 100vw, 62vw"
      />
    </div>
  );
}

export function Site() {
  const [panel, setPanel] = useState<Panel>("music");
  const [selectedReleaseId, setSelectedReleaseId] = useState<Id<"releases"> | null>(
    null,
  );
  const [selectedLivesetId, setSelectedLivesetId] = useState<Id<"livesets"> | null>(
    null,
  );
  const releases = useQuery(api.releases.list);
  const livesets = useQuery(api.livesets.list);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = useQuery(api.shows.listUpcoming, { today });
  const nextShow = upcoming?.[0] ?? null;
  const countdown = useCountdown(nextShow?.date ?? null);

  const selectedRelease =
    releases?.find((r) => r._id === selectedReleaseId) ?? releases?.[0] ?? null;
  const selectedLiveset =
    livesets?.find((l) => l._id === selectedLivesetId) ?? livesets?.[0] ?? null;

  let mediaSrc = "/press.png";
  let mediaAlt = "Vion Konger";

  if (panel === "music" && selectedRelease?.coverUrl) {
    mediaSrc = selectedRelease.coverUrl;
    mediaAlt = selectedRelease.title;
  } else if (panel === "livesets" && selectedLiveset?.coverUrl) {
    mediaSrc = selectedLiveset.coverUrl;
    mediaAlt = selectedLiveset.title;
  }

  const isPress = mediaSrc === "/press.png";

  const nextShowLabel =
    countdown && nextShow
      ? `Next · ${nextShow.city} · ${countdown.d}d ${pad(countdown.h)}h ${pad(countdown.m)}m`
      : null;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden overscroll-none bg-background text-foreground">
      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="flex min-h-0 flex-col border-b border-border md:border-b-0 md:border-r">
          <div className="shrink-0 border-b border-border px-4 py-4 md:px-5 md:py-5">
            <Image
              src="/logo-white.png"
              alt="Vion Konger"
              width={1200}
              height={240}
              className="h-auto w-full"
              priority
            />
          </div>

          <SiteNav panel={panel} onPanelChange={setPanel} />

          {nextShowLabel && (
            <p className="label shrink-0 truncate border-b border-border px-4 py-2.5 text-center text-muted">
              {nextShowLabel}
            </p>
          )}

          <div className="relative h-[46vh] shrink-0 border-b border-border md:hidden">
            <MediaPane src={mediaSrc} alt={mediaAlt} isPress={isPress} />
          </div>

          <div className="min-h-0 flex-1">
            {panel === "music" && (
              <MusicPanel
                selectedId={selectedRelease?._id ?? null}
                onSelect={setSelectedReleaseId}
              />
            )}
            {panel === "tour" && <TourPanel today={today} />}
            {panel === "livesets" && (
              <LivesetsPanel
                selectedId={selectedLiveset?._id ?? null}
                onSelect={setSelectedLivesetId}
              />
            )}
            {panel === "links" && <LinksPanel />}
            {panel === "contact" && <ContactPanel />}
          </div>
        </div>

        <div className="relative hidden min-h-0 md:block">
          <MediaPane src={mediaSrc} alt={mediaAlt} isPress={isPress} />
        </div>
      </div>
    </div>
  );
}
