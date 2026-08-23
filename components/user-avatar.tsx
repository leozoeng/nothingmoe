"use client";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function UserAvatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "user-avatar-sm" : size === "lg" ? "user-avatar-lg" : "user-avatar-md";

  return (
    <span className={`user-avatar ${sizeClass}`} aria-hidden="true">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="user-avatar-fallback">{initials(name)}</span>
      )}
    </span>
  );
}
