"use client";

import { useEffect, useState } from "react";

function readFlag(name: string) {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(name) === "1";
}

function readDemoMode() {
  return readFlag("demo");
}

export function useDemoMode() {
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    setDemoMode(readDemoMode());
  }, []);

  return demoMode;
}

export function useOwnerPreview() {
  const [ownerPreview, setOwnerPreview] = useState(false);

  useEffect(() => {
    setOwnerPreview(readFlag("owner"));
  }, []);

  return ownerPreview;
}
