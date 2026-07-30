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

const PRESS_IMAGES = [
  { src: "/press/main-press.png", position: "center 18%" },
  { src: "/press/vk-press-8.jpg", position: "center 22%" },
  { src: "/press/vk-press-12.jpg", position: "center 28%" },
  { src: "/press/vk-press-2.jpg", position: "center 20%" },
  { src: "/press/show-wide.png", position: "center center" },
] as const;

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

type MediaState = {
  src: string;
  alt: string;
  position: string;
};

function MediaPane({ src, alt, position }: MediaState) {
  const [base, setBase] = useState<MediaState>({ src, alt, position });
  const [overlay, setOverlay] = useState<MediaState | null>(null);
  const [overlayOpaque, setOverlayOpaque] = useState(false);
  const overlaySrc = overlay?.src ?? null;

  useEffect(() => {
    const showing = overlaySrc ?? base.src;

    if (src === showing) {
      if (overlaySrc) {
        setOverlay((prev) => (prev ? { ...prev, alt, position } : prev));
      } else {
        setBase((prev) => ({ ...prev, alt, position }));
      }
      return;
    }

    if (src === base.src && overlaySrc) {
      setOverlay(null);
      setOverlayOpaque(false);
      setBase({ src, alt, position });
      return;
    }

    setOverlay({ src, alt, position });
    setOverlayOpaque(false);
  }, [src, alt, position, base.src, overlaySrc]);

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
        position={base.position}
        opaque
        priority
      />
      {overlay && (
        <MediaLayer
          src={overlay.src}
          alt={overlay.alt}
          position={overlay.position}
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
  position,
  opaque,
  priority,
  onReady,
  onFadeEnd,
}: {
  src: string;
  alt: string;
  position: string;
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
          requestAnimationFrame(() => {
            requestAnimationFrame(() => onReady?.());
          });
        }}
        className="object-cover"
        style={{ objectPosition: position }}
        sizes="(max-width: 768px) 100vw, 80vw"
      />
    </div>
  );
}

export function Site() {
  const [panel, setPanel] = useState<Panel>("music");
  const [pressIndex, setPressIndex] = useState(PRESS_IMAGES.length - 1);
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

  const press = PRESS_IMAGES[pressIndex % PRESS_IMAGES.length]!;
  let mediaSrc = press.src;
  let mediaAlt = "Vion Konger";
  let mediaPosition = press.position;

  if (panel === "music" && selectedRelease?.coverUrl) {
    mediaSrc = selectedRelease.coverUrl;
    mediaAlt = selectedRelease.title;
    mediaPosition = "center center";
  } else if (panel === "livesets" && selectedLiveset?.coverUrl) {
    mediaSrc = selectedLiveset.coverUrl;
    mediaAlt = selectedLiveset.title;
    mediaPosition = "center center";
  }

  const nextShowLabel =
    countdown && nextShow
      ? `Next · ${nextShow.city} · ${countdown.d}d ${pad(countdown.h)}h ${pad(countdown.m)}m`
      : null;

  function handlePanelChange(next: Panel) {
    if (next !== panel) {
      setPressIndex((index) => (index + 1) % PRESS_IMAGES.length);
    }
    setPanel(next);
  }

  return (
    <div className="fixed inset-0 flex w-full flex-col overflow-hidden overscroll-none bg-background text-foreground">
      <div className="grid min-h-0 min-w-0 w-full flex-1 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="flex min-h-0 min-w-0 w-full max-w-full flex-col overflow-x-hidden border-b border-border md:border-b-0 md:border-r">
          <div className="w-full shrink-0 border-b border-border px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top,0px))] md:px-5 md:pb-5 md:pt-5">
            <Image
              src="/logo-white.png"
              alt="Vion Konger"
              width={1200}
              height={240}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="h-auto w-full max-w-full"
              priority
            />
          </div>

          <SiteNav panel={panel} onPanelChange={handlePanelChange} />

          {nextShowLabel && (
            <p className="label w-full shrink-0 truncate border-b border-border px-4 py-2 text-center text-muted md:py-2.5">
              {nextShowLabel}
            </p>
          )}

          <div className="relative h-[30vh] w-full shrink-0 border-b border-border md:hidden">
            <MediaPane src={mediaSrc} alt={mediaAlt} position={mediaPosition} />
          </div>

          <div className="min-h-0 min-w-0 w-full flex-1 overflow-hidden">
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

        <div className="relative hidden min-h-0 min-w-0 md:block">
          <MediaPane src={mediaSrc} alt={mediaAlt} position={mediaPosition} />
        </div>
      </div>
    </div>
  );
}
