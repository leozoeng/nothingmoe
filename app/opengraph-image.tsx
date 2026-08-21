import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "NothingMoe";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const bytes = await readFile(join(process.cwd(), "public/mark-256.png"));
  const src = `data:image/png;base64,${bytes.toString("base64")}`;

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
          background: "#050505",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse 50% 45% at 50% 42%, rgba(255,183,197,0.10), transparent 70%)",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          width={96}
          height={96}
          alt=""
          style={{
            width: 96,
            height: 96,
            borderRadius: 22,
            boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
          }}
        />
        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "baseline",
            color: "#f2f2f2",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          NothingMoe
          <span
            style={{
              marginLeft: 2,
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "rgba(244,244,244,0.35)",
            }}
          >
            .com
          </span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 18,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(244,244,244,0.38)",
          }}
        >
          nothing here is dog shit
        </div>
      </div>
    ),
    { ...size },
  );
}
