"use client";
import { useEffect, useState, useRef } from "react";
import { AuthProvider, useAuth } from "../../components/AuthContext";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

function SuccessContent() {
  const { user } = useAuth();
  const [status, setStatus] = useState("activating");
  const written = useRef(false);

  // Write premium to Firestore as soon as we have a user — background, don't block UI
  useEffect(() => {
    if (!user || written.current) return;
    written.current = true;
    setDoc(doc(db, "users", user.uid), {
      isPremium: true,
      premiumSince: new Date().toISOString(),
    }, { merge: true }).catch(console.error);
  }, [user]);

  // Show ready after 1.5s regardless — don't make user wait for auth
  useEffect(() => {
    const t = setTimeout(() => setStatus("ready"), 1500);
    return () => clearTimeout(t);
  }, []);

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
        <div style={{ fontSize: 56, marginBottom: 16 }}>
          {status === "activating" ? "⏳" : "👑"}
        </div>
        <div style={{
          fontFamily: "Georgia, serif",
          fontSize: 26,
          color: "#D4A847",
          fontWeight: 700,
          marginBottom: 10,
        }}>
          {status === "activating" ? "Activating…" : "Welcome to Premium!"}
        </div>
        <div style={{
          color: "rgba(255,255,255,0.75)",
          fontSize: 15,
          lineHeight: 1.6,
          marginBottom: 28,
        }}>
          {status === "activating"
            ? "Just a second…"
            : "You now have full access to voice capture, photo scanning, and nutrition tracking."}
        </div>

        {status === "ready" && (
          <>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28, textAlign:"left" }}>
              {[
                ["🎤", "Voice ingredient capture"],
                ["📷", "AI photo scanning"],
                ["🔢", "Full macros & nutrition"],
                ["♾️", "Unlimited favorites"],
              ].map(([icon, label]) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:12, color:"rgba(255,255,255,0.85)", fontSize:14 }}>
                  <span style={{ fontSize:20 }}>{icon}</span>
                  {label}
                  <span style={{ marginLeft:"auto", color:"#D4A847" }}>✓</span>
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
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, marginTop:14 }}>
              Cancel anytime · No charge for 7 days
            </div>
          </>
        )}

        {status === "activating" && (
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:8 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:8, height:8, borderRadius:"50%", background:"#D4A847",
                animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <AuthProvider>
      <SuccessContent />
    </AuthProvider>
  );
}
