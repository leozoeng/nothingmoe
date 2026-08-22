"use client";

import { useEffect, useState } from "react";

function readDemoMode() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "1";
}

export function useDemoMode() {
  const [demoMode, setDemoMode] = useState(readDemoMode);

  useEffect(() => {
    setDemoMode(readDemoMode());
  }, []);

  return demoMode;
}
