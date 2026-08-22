"use client";

import { useEffect, useRef, useState } from "react";

const SRC = "/audio/bgm.mp3";
const VOLUME = 0.32;

export function MusicToggle() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = new Audio(SRC);
    el.loop = true;
    el.volume = VOLUME;
    el.preload = "auto";
    audio.current = el;

    return () => {
      el.pause();
      audio.current = null;
    };
  }, []);

  const toggle = async () => {
    const el = audio.current;
    if (!el) return;

    if (on) {
      el.pause();
      setOn(false);
      return;
    }

    try {
      await el.play();
      setOn(true);
    } catch {
      setOn(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute music" : "Play music"}
      className="fixed bottom-5 right-5 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-chrome/70 backdrop-blur-md transition-colors duration-300 hover:text-chrome sm:bottom-6 sm:right-6"
    >
      {on ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 9v6h3l5 4V5L7 9H4zm13.5 3c0-1.8-1-3.3-2.5-4v8c1.5-.7 2.5-2.2 2.5-4zM14 3.2v2.1c2.9.9 5 3.5 5 6.7s-2.1 5.8-5 6.7v2.1c4-.9 7-4.5 7-8.8s-3-7.9-7-8.8z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16.5 12c0-1.8-1-3.3-2.5-4v2.2l2.4 2.4c.1-.2.1-.4.1-.6zm2.5 0c0 .9-.2 1.8-.5 2.6l1.5 1.5c.7-1.2 1-2.6 1-4.1 0-4.3-3-7.9-7-8.8v2.1c2.9.9 5 3.5 5 6.7zM4.3 3 3 4.3 7.7 9H4v6h3l5 4v-6.7l4.8 4.8c-.8.6-1.7 1-2.8 1.3v2.1c1.4-.3 2.6-.9 3.7-1.7L19.7 21 21 19.7 4.3 3zM12 4 9.9 6.1 12 8.2V4z"
          />
        </svg>
      )}
    </button>
  );
}
