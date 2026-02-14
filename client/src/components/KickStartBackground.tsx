"use client";

export default function KickStartBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Electric blue base */}
      <div className="absolute inset-0 bg-[#225aff]" />

      {/* Grid pattern - subtle white/lighter lines */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Diagonal grid overlay */}
      <div
        className="absolute inset-0 opacity-20 -rotate-[3deg] scale-110"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Solid white stars scattered */}
      {[
        { top: "8%", left: "5%", size: 12 },
        { top: "15%", right: "12%", size: 8 },
        { top: "85%", left: "8%", size: 14 },
        { top: "90%", left: "25%", size: 6 },
        { top: "88%", right: "15%", size: 10 },
        { top: "92%", right: "35%", size: 8 },
        { top: "12%", right: "30%", size: 6 },
      ].map((s, i) => (
        <div
          key={`star-w-${i}`}
          className="absolute text-white opacity-70"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            width: s.size,
            height: s.size,
          }}
        >
          <StarSolid />
        </div>
      ))}

      {/* Dark blue solid stars */}
      {[
        { top: "20%", left: "15%", size: 10 },
        { top: "75%", left: "12%", size: 8 },
        { top: "80%", right: "25%", size: 12 },
      ].map((s, i) => (
        <div
          key={`star-b-${i}`}
          className="absolute text-[#1d4ed8] opacity-90"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            width: s.size,
            height: s.size,
          }}
        >
          <StarSolid />
        </div>
      ))}

      {/* Outlined star - top left (large) */}
      <div
        className="absolute top-[5%] left-[3%] w-16 h-16 text-white opacity-60"
        style={{ transform: "rotate(-15deg)" }}
      >
        <StarOutlined />
      </div>

      {/* Streaking star trails */}
      <div className="absolute top-[40%] right-[8%] w-20 h-2 opacity-30">
        <svg viewBox="0 0 80 8" fill="none" className="w-full h-full">
          <path
            d="M0 4 L80 4"
            stroke="white"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
      <div className="absolute top-[55%] right-[5%] w-16 h-2 opacity-25 rotate-12">
        <svg viewBox="0 0 64 8" fill="none" className="w-full h-full">
          <path
            d="M0 4 L64 4"
            stroke="white"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        </svg>
      </div>

      {/* Sparkle/burst shapes */}
      {[
        { top: "70%", left: "5%", size: 16 },
        { top: "85%", right: "8%", size: 12 },
        { top: "10%", left: "25%", size: 10 },
      ].map((s, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute text-white opacity-50"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            width: s.size,
            height: s.size,
          }}
        >
          <Sparkle />
        </div>
      ))}
    </div>
  );
}

function StarSolid() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2L15 9L22 9L17 14L19 21L12 17L5 21L7 14L2 9L9 9L12 2Z" />
    </svg>
  );
}

function StarOutlined() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path d="M12 2L15 9L22 9L17 14L19 21L12 17L5 21L7 14L2 9L9 9L12 2Z" />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path d="M12 2V22M2 12H22M4 4L20 20M20 4L4 20" />
    </svg>
  );
}
