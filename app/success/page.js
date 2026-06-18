export const dynamic = "force-dynamic";

export default function SuccessPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#FDF6EE",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        background: "#2C1A0E",
        borderRadius: 24,
        padding: "40px 32px",
        maxWidth: 380,
        width: "100%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>👑</div>
        <div style={{
          fontFamily: "Georgia, serif",
          fontSize: 26,
          color: "#D4A847",
          fontWeight: 700,
          marginBottom: 10,
        }}>
          Welcome to Premium!
        </div>
        <div style={{
          color: "rgba(255,255,255,0.75)",
          fontSize: 15,
          lineHeight: 1.6,
          marginBottom: 28,
        }}>
          Your 7-day free trial has started. You now have full access to voice capture, photo scanning, and nutrition tracking.
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 28,
          textAlign: "left",
        }}>
          {[
            ["🎤", "Voice ingredient capture"],
            ["📷", "AI photo scanning"],
            ["🔢", "Full macros & nutrition"],
            ["♾️", "Unlimited favorites"],
          ].map(([icon, label]) => (
            <div key={label} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "rgba(255,255,255,0.85)",
              fontSize: 14,
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              {label}
              <span style={{ marginLeft: "auto", color: "#D4A847" }}>✓</span>
            </div>
          ))}
        </div>
        <a href="/" style={{
          display: "block",
          background: "linear-gradient(135deg,#C4622D,#A0481F)",
          color: "#fff",
          borderRadius: 14,
          padding: "14px 0",
          fontSize: 15,
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 4px 16px rgba(196,98,45,0.35)",
        }}>
          Start cooking →
        </a>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 14 }}>
          Cancel anytime · No charge for 7 days
        </div>
      </div>
    </div>
  );
}
