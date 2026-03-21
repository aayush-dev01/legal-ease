import { useRef, useEffect } from "react";
import {
  useViewportScroll,
  useTransform,
  motion,
} from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Higher Order Component pattern from reference code
// Wraps a component with scroll progress 0→1
function withScrolledProgress(Component) {
  const startY = 800;
  const distance = 1600;
  const endY = startY + distance;

  return function WrappedComponent(props) {
    const { scrollY } = useViewportScroll();
    const progress = useTransform(scrollY, [startY, endY], [0, 1]);

    useEffect(() => {
      const container = document.querySelector(".scroll-container");
      if (!container) return;

      // GSAP keyframe scrub matching reference code exactly
      const ctx = gsap.context(() => {
        gsap.to(".doc-gsap-layer", {
          scrollTrigger: {
            trigger: ".scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
          keyframes: [
            { opacity: 1, y: 0, rotateZ: 0, scale: 1 },
            { opacity: 1, y: -20, rotateZ: -2, scale: 1.02 },
            { opacity: 1, y: -50, rotateZ: -5, scale: 1.05 },
            { opacity: 1, y: -90, rotateZ: -3, scale: 1.08 },
            { opacity: 0.9, y: -140, rotateZ: 0, scale: 1.1 },
            { opacity: 0.8, y: -100, rotateZ: 2, scale: 1.05 },
            { opacity: 0.7, y: -60, rotateZ: 4, scale: 1.02 },
            { opacity: 0.6, y: -30, rotateZ: 2, scale: 1.01 },
            { opacity: 0.5, y: -10, rotateZ: 1, scale: 1.0 },
            { opacity: 0.3, y: 0, rotateZ: 0, scale: 0.98 },
            { opacity: 0, y: 10, rotateZ: 0, scale: 0.95 },
          ],
          ease: "linear",
          duration: 10,
          stagger: 0.08,
        });
      });

      return () => {
        ctx.revert();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }, []);

    return <Component {...props} progress={progress} />;
  };
}

// Document data
const DOCS = [
  {
    id: 1,
    label: "Document 01",
    title: "GST Registration",
    lines: [
      "PAN Card of proprietor",
      "Aadhaar Card",
      "Business Address Proof",
      "Bank Account Details",
    ],
    x: -300,
    y: -80,
    z: 0,
    rotate: -10,
    delay: 0,
  },
  {
    id: 2,
    label: "Document 02",
    title: "Risk Score Analysis",
    lines: [
      "Compliance Score: 72/100",
      "Risk Level: Medium",
      "5 Actions Required",
      "2 Critical Issues",
    ],
    x: 20,
    y: 50,
    z: -80,
    rotate: 2,
    delay: 0.1,
  },
  {
    id: 3,
    label: "Document 03",
    title: "Action Plan",
    lines: [
      "Week 1: Apply FSSAI",
      "Week 2: GST Registration",
      "Week 3: Udyam (MSME)",
      "Week 4: Trade License",
    ],
    x: 300,
    y: -60,
    z: -160,
    rotate: 8,
    delay: 0.2,
  },
];

// The inner animation component
function AnimationInner({ progress }) {
  // Each doc spreads out from center as scroll progress goes 0→0.5
  // then collapses back as progress goes 0.5→1
  const spreadPhase = useTransform(progress, [0, 0.5], [0, 1]);
  const collapsePhase = useTransform(progress, [0.5, 1.0], [0, 1]);
  const containerOpacity = useTransform(
    progress,
    [0, 0.05, 0.9, 1.0],
    [0, 1, 1, 0]
  );

  return (
    <motion.div
      style={{
        opacity: containerOpacity,
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
    >
      {/* Radial ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Document panels */}
      {DOCS.map((doc) => (
        <DocumentPanel
          key={doc.id}
          doc={doc}
          spreadPhase={spreadPhase}
          collapsePhase={collapsePhase}
        />
      ))}

      {/* Center label */}
      <motion.div
        style={{
          position: "absolute",
          textAlign: "center",
          pointerEvents: "none",
          opacity: useTransform(spreadPhase, [0, 0.3], [1, 0]),
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "Lato, sans-serif",
            marginBottom: 8,
          }}
        >
          Scroll to explore
        </div>
        <div
          style={{
            width: 1,
            height: 40,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)",
            margin: "0 auto",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// Single document panel component
function DocumentPanel({ doc, spreadPhase, collapsePhase }) {
  const x = useTransform(spreadPhase, [0, 1], [0, doc.x]);
  const y = useTransform(spreadPhase, [0, 1], [0, doc.y]);
  const rotateZ = useTransform(spreadPhase, [0, 1], [0, doc.rotate]);
  const scale = useTransform(spreadPhase, [0, 0.5, 1], [0.9, 1.05, 1]);

  // Collapse back to center on second half of scroll
  const collapseX = useTransform(collapsePhase, [0, 1], [0, -doc.x * 0.3]);
  const collapseY = useTransform(collapsePhase, [0, 1], [0, -doc.y * 0.3]);
  const collapseRotate = useTransform(collapsePhase, [0, 1], [0, -doc.rotate * 0.5]);

  return (
    <motion.div
      className="doc-gsap-layer"
      style={{
        position: "absolute",
        x,
        y,
        rotateZ,
        scale,
        left: "50%",
        top: "50%",
        marginLeft: -130,
        marginTop: -90,
        width: 260,
        minHeight: 180,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "1.25rem 1.5rem",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.6)",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Top label */}
      <div
        style={{
          fontSize: 9,
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: 8,
          fontFamily: "Lato, sans-serif",
        }}
      >
        {doc.label}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#FFFFFF",
          marginBottom: 12,
          fontFamily: "Playfair Display, serif",
          lineHeight: 1.3,
        }}
      >
        {doc.title}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.06)",
          marginBottom: 10,
        }}
      />

      {/* Lines */}
      {doc.lines.map((line, j) => (
        <div
          key={j}
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
            padding: "5px 0",
            borderBottom:
              j < doc.lines.length - 1
                ? "1px solid rgba(255,255,255,0.04)"
                : "none",
            fontFamily: "Lato, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              flexShrink: 0,
            }}
          />
          {line}
        </div>
      ))}
    </motion.div>
  );
}

// Apply the HOC exactly as in reference code
const AnimationWithProgress = withScrolledProgress(AnimationInner);

// Mobile fallback — static stacked cards with fade-in
function MobileFallback() {
  return (
    <div
      className="doc-animation-mobile"
      style={{
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "2rem 1rem",
      }}
    >
      {DOCS.map((doc, i) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.15, ease: "easeInOut" }}
          viewport={{ once: true }}
          style={{
            width: "100%",
            maxWidth: 320,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "1rem 1.25rem",
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: 6,
              fontFamily: "Lato, sans-serif",
            }}
          >
            {doc.label}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "Playfair Display, serif",
            }}
          >
            {doc.title}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Main export
export default function DocumentAnimation() {
  return (
    <>
      {/* Desktop: scroll-driven 3D animation */}
      <div
        className="scroll-container doc-animation-desktop"
        style={{ height: "300vh", position: "relative" }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimationWithProgress />
        </div>
      </div>

      {/* Mobile: static fallback */}
      <MobileFallback />
    </>
  );
}
