"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";

// §mod-2 — founder story video, positioned ABOVE social proof. Lazy: nothing
// heavy loads until the user taps play, so it never costs the hero's LCP.
// Plays inline on mobile. Falls back to a calm placeholder when no URL is set.
const VIDEO_URL = process.env.NEXT_PUBLIC_FOUNDER_VIDEO_URL;

function isFileVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export function FounderVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <Section>
      <h2 className="text-2xl sm:text-3xl">Why I built this.</h2>
      <p className="mt-2 text-ink-soft">A short note from the founder.</p>

      <div className="mt-5 overflow-hidden rounded-3xl border border-line bg-ink/5 aspect-video">
        {!VIDEO_URL ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-ink-soft">
            A short note from the founder is on its way. The written version is just
            below.
          </div>
        ) : !playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="Play the founder's note"
            className="group relative flex h-full w-full items-center justify-center bg-primary-deep/90"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-105">
              <span className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-primary-deep" />
            </span>
          </button>
        ) : isFileVideo(VIDEO_URL) ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            className="h-full w-full"
            src={VIDEO_URL}
            controls
            autoPlay
            playsInline
          />
        ) : (
          <iframe
            className="h-full w-full"
            src={VIDEO_URL}
            title="A note from the founder"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </Section>
  );
}
