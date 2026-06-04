"use client";

import Link from "next/link";

interface SunixLogoProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  asLink?: boolean;
}

/**
 * Sunix brand logo:
 * - Dark navy lowercase "sunix"
 * - The dot of "i" is replaced by a red square
 * Uses the dotless-ı (U+0131) trick so no dot appears from the font,
 * then a red square is absolutely positioned above it.
 */
export function SunixLogo({ className = "", style, onClick, asLink = true }: SunixLogoProps) {
  const logo = (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-nunito), 'Nunito', sans-serif",
        fontWeight: 900,
        fontSize: "inherit",
        color: "#0b1d4a",
        letterSpacing: "-0.03em",
        display: "inline-flex",
        alignItems: "baseline",
        lineHeight: 1,
        userSelect: "none",
        ...style,
      }}
      aria-label="Sunix"
    >
      sun
      {/* dotless-i trick: ı has no tittle, we add a red square above */}
      <span style={{ position: "relative", display: "inline-block" }}>
        ı
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-0.18em",
            left: "50%",
            transform: "translateX(-50%)",
            width: "0.22em",
            height: "0.22em",
            backgroundColor: "#cc1c1c",
            borderRadius: "1px",
            display: "block",
          }}
        />
      </span>
      x
    </span>
  );

  if (!asLink) return logo;

  return (
    <Link
      href="/"
      onClick={onClick}
      className="flex-shrink-0 cursor-pointer"
      aria-label="Ana Sayfaya Git — Sunix Store"
    >
      {logo}
    </Link>
  );
}
