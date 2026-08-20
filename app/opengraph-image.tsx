import { ImageResponse } from "next/og";

export const alt = "nothingmoe — nothinghereisdarkshit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0b0a",
          color: "#ede8df",
          letterSpacing: "0.18em",
        }}
      >
        <div style={{ fontSize: 42, fontFamily: "serif", opacity: 0.55 }}>無</div>
        <div
          style={{
            marginTop: 28,
            fontSize: 72,
            fontFamily: "serif",
            fontWeight: 400,
          }}
        >
          nothingmoe
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 22,
            fontFamily: "sans-serif",
            letterSpacing: "0.28em",
            opacity: 0.55,
          }}
        >
          nothinghereisdarkshit
        </div>
      </div>
    ),
    { ...size },
  );
}
