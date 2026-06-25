import { ImageResponse } from "next/og";

// Dynamically generated share image (no binary asset needed). Next wires this into
// the og:image / twitter:image tags for every page. Copy is supportive/educational
// to stay Meta personal-attributes-safe when shared.
export const runtime = "nodejs";
export const alt = "The Symptom Spiral Reset";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#F5F6F3",
          color: "#16242B",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#205A4F" }}>
          Built on CBT &amp; ERP methods · Not medical advice
        </div>
        <div style={{ fontSize: 62, fontWeight: 600, marginTop: 24, lineHeight: 1.1 }}>
          The relief from Googling your symptoms lasts about four minutes.
        </div>
        <div style={{ fontSize: 30, color: "#51616A", marginTop: 28 }}>
          The Symptom Spiral Reset — a 14-day reset. Take the free 2-minute assessment.
        </div>
      </div>
    ),
    { ...size }
  );
}
