import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const alt = "Jaimin Panchal — Full Stack AI Developer";

// Social share card in the site's noir/champagne system.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "#0a0a0b",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 520,
            background:
              "radial-gradient(circle, rgba(201,168,118,0.28), transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#83807a",
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 10,
              background: "#c9a876",
              display: "flex",
            }}
          />
          Portfolio
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 96,
            fontWeight: 700,
            color: "#f3f1ed",
            lineHeight: 1.02,
            display: "flex",
          }}
        >
          Jaimin Panchal
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 38,
            color: "#c9a876",
            display: "flex",
          }}
        >
          Full Stack AI Developer
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 26,
            color: "#a3a09a",
            display: "flex",
          }}
        >
          Spring Boot · React · Next.js · LLM Integration · Cloud
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
