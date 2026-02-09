"use client";

import React from "react";

export function PopShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={shell}>
      <style>{css}</style>
      <div style={bgBlob1} />
      <div style={bgBlob2} />
      <div style={container}>
        <header style={header}>
          <div style={brand}>
            <span style={{ fontSize: 28 }}>🌈</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 0.3 }}>
                ポイントの木
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                みんなで育てるゲーム
              </div>
            </div>
          </div>
        </header>

        <div style={content}>{children}</div>

        <footer style={footer}>© Point Game</footer>
      </div>
    </div>
  );
}

export function PopCard({
  icon,
  title,
  children,
}: {
  icon?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={card} className="pop-card">
      {(icon || title) && (
        <div style={cardHead}>
          {icon ? <div style={cardIcon}>{icon}</div> : null}
          {title ? <div style={cardTitle}>{title}</div> : null}
        </div>
      )}
      <div style={cardBody}>{children}</div>
    </section>
  );
}

export function PopButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
}) {
  const base =
    variant === "primary"
      ? btnPrimary
      : variant === "danger"
      ? btnDanger
      : btnGhost;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="pop-btn"
      style={{ ...btn, ...base, opacity: disabled ? 0.6 : 1 }}
    >
      {children}
    </button>
  );
}

export function PopInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="pop-input" style={input} />;
}

export function PopSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="pop-input" style={input} />;
}

export function PopTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="pop-input" style={{ ...input, height: "auto" }} />;
}

export function PopPill({ children }: { children: React.ReactNode }) {
  return <span style={pill}>{children}</span>;
}

export function PopBigNumber({ children }: { children: React.ReactNode }) {
  return <div style={bigNum} className="pop-big">{children}</div>;
}

const shell: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0b1220 0%, #101a33 55%, #0b1220 100%)",
  color: "#fff",
  position: "relative",
  overflow: "hidden",
};

const container: React.CSSProperties = {
  maxWidth: 920,
  margin: "0 auto",
  padding: "18px 14px 28px",
  position: "relative",
  zIndex: 2,
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const brand: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.16)",
  backdropFilter: "blur(6px)",
};

const content: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const footer: React.CSSProperties = {
  marginTop: 18,
  opacity: 0.65,
  fontSize: 12,
  textAlign: "center",
};

const card: React.CSSProperties = {
  borderRadius: 18,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
  overflow: "hidden",
};

const cardHead: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "14px 14px 10px",
};

const cardIcon: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.16)",
  fontSize: 22,
};

const cardTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  letterSpacing: 0.2,
};

const cardBody: React.CSSProperties = {
  padding: "0 14px 14px",
  fontSize: 18,
  lineHeight: 1.7,
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "none",
  fontWeight: 900,
  fontSize: 18,
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  background: "linear-gradient(135deg, #ffdf6e 0%, #ff7bd5 50%, #7ce7ff 100%)",
  color: "#101a33",
};

const btnDanger: React.CSSProperties = {
  background: "linear-gradient(135deg, #ff6b6b 0%, #ffb86b 100%)",
  color: "#101a33",
};

const btnGhost: React.CSSProperties = {
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.22)",
  color: "#fff",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  fontSize: 18,
  fontWeight: 800,
  outline: "none",
};

const pill: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.18)",
  fontWeight: 900,
  fontSize: 14,
};

const bigNum: React.CSSProperties = {
  fontSize: 52,
  fontWeight: 950,
  letterSpacing: 0.6,
  textShadow: "0 10px 30px rgba(0,0,0,0.35)",
};

const bgBlob1: React.CSSProperties = {
  position: "absolute",
  width: 520,
  height: 520,
  borderRadius: "50%",
  left: -140,
  top: -160,
  background: "radial-gradient(circle at 30% 30%, rgba(255,223,110,0.55), rgba(255,123,213,0.0) 65%)",
  filter: "blur(2px)",
  zIndex: 1,
};

const bgBlob2: React.CSSProperties = {
  position: "absolute",
  width: 620,
  height: 620,
  borderRadius: "50%",
  right: -200,
  bottom: -240,
  background: "radial-gradient(circle at 30% 30%, rgba(124,231,255,0.55), rgba(124,231,255,0.0) 65%)",
  filter: "blur(2px)",
  zIndex: 1,
};

const css = `
  .pop-card { animation: popIn .35s ease-out both; }
  .pop-btn { transition: transform .08s ease, filter .12s ease; }
  .pop-btn:active { transform: translateY(1px) scale(0.99); }
  .pop-btn:hover { filter: brightness(1.06); }
  .pop-input:focus { box-shadow: 0 0 0 4px rgba(124,231,255,0.20); border-color: rgba(124,231,255,0.55); }
  @keyframes popIn {
    from { transform: translateY(8px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pop-card { animation: none; }
    .pop-btn { transition: none; }
  }
`;
