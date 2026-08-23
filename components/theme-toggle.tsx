"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
    >
      {isLight ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3a1 1 0 0 1 1 1v1.1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 14.4A5.4 5.4 0 1 0 12 6.6a5.4 5.4 0 0 0 0 10.8ZM4.9 5.5a1 1 0 0 1 1.4 0l.8.8a1 1 0 1 1-1.4 1.4l-.8-.8a1 1 0 0 1 0-1.4Zm12 12a1 1 0 0 1 1.4 0l.8.8a1 1 0 0 1-1.4 1.4l-.8-.8a1 1 0 0 1 0-1.4ZM3 12a1 1 0 0 1 1-1h1.1a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm14.9 0a1 1 0 0 1 1-1H20a1 1 0 1 1 0 2h-1.1a1 1 0 0 1-1-1ZM5.7 16.7a1 1 0 0 1 1.4 0l.8.8a1 1 0 1 1-1.4 1.4l-.8-.8a1 1 0 0 1 0-1.4Zm12-12a1 1 0 0 1 1.4 0l.8.8a1 1 0 0 1-1.4 1.4l-.8-.8a1 1 0 0 1 0-1.4Z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M20.4 14.2A8.2 8.2 0 0 1 9.8 3.6a.8.8 0 0 0-1.1-.9A9.8 9.8 0 1 0 21.3 15.3a.8.8 0 0 0-.9-1.1Z"
          />
        </svg>
      )}
    </button>
  );
}
