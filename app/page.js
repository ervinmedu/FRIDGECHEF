"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { AuthProvider, useAuth } from "../components/AuthContext";
import { getFavorites, addFavorite, removeFavorite, getMealPlan, saveMealPlan, getPremiumStatus } from "../lib/db";

// ─── Palette ──────────────────────────────────────────────────
const C = {
  cream:     "#FDF6EE",
  espresso:  "#2C1A0E",
  terra:     "#C4622D",
  terraLight:"#F5E6D0",
  terraDeep: "#A0481F",
  cardBg:    "#FFFFFF",
  border:    "#EDE0D0",
  muted:     "#9C8472",
  gold:      "#D4A847",
  success:   "#3A7D44",
  errorBg:   "#FFEBEE",
  errorText: "#C62828",
};

// ─── Constants ────────────────────────────────────────────────
const TABS = ["recipes","planner","favorites","grocery"];
const TAB_ICONS = { recipes:"🍳", planner:"📅", favorites:"❤️", grocery:"🛒" };
const TAB_LABELS = { recipes:"Cook", planner:"Planner", favorites:"Saved", grocery:"Grocery" };
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAY_NAMES = { Mon:"Monday",Tue:"Tuesday",Wed:"Wednesday",Thu:"Thursday",Fri:"Friday",Sat:"Saturday",Sun:"Sunday" };
const MEALS = ["Breakfast","Lunch","Dinner"];
const DIET_OPTIONS = [
  { value:"any",         label:"Any",         icon:"🍽" },
  { value:"vegetarian",  label:"Vegetarian",  icon:"🥦" },
  { value:"vegan",       label:"Vegan",       icon:"🌱" },
  { value:"halal",       label:"Halal",       icon:"☪️" },
  { value:"low-carb",    label:"Low-carb",    icon:"💪" },
  { value:"gluten-free", label:"Gluten-free", icon:"🌾" },
];
const TIME_OPTIONS = [
  { value:"15",  label:"15 min",  icon:"⚡" },
  { value:"30",  label:"30 min",  icon:"🕐" },
  { value:"60",  label:"1 hour",  icon:"⏱" },
  { value:"120", label:"Any",     icon:"🍲" },
];

// ─── API helper ───────────────────────────────────────────────
async function callClaude(prompt, system) {
  const res = await fetch("/api/claude", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ prompt, system }),
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}

function parseJSON(text) {
  try { return JSON.parse(text.replace(/```json|```/g,"").trim()); }
  catch { return null; }
}

// ─── Premium Modal ────────────────────────────────────────────
function PremiumModal({ onClose, onUpgrade }) {
  const [billing, setBilling] = useState("yearly");
  const monthly = 8.99;
  const yearly  = 71.99;
  const perMonth = (yearly / 12).toFixed(2);
  const savings  = Math.round((1 - yearly / (monthly * 12)) * 100);

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(44,26,14,0.7)",
      zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center",
      padding:16,
    }}>
      <div style={{
        background:C.espresso, borderRadius:24, padding:28, maxWidth:380, width:"100%",
        position:"relative", maxHeight:"90vh", overflowY:"auto",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.1)",
          border:"none", color:"#fff", width:32, height:32, borderRadius:"50%",
          cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center",
        }}>×</button>

        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>👑</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.gold, fontWeight:700 }}>
            FridgeChef Premium
          </div>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, marginTop:6 }}>
            Cook smarter. Eat better.
          </div>
        </div>

        {/* Billing toggle */}
        <div style={{
          display:"flex", background:"rgba(255,255,255,0.1)", borderRadius:12, padding:4,
          marginBottom:20, gap:4,
        }}>
          {["monthly","yearly"].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{
              flex:1, border:"none", borderRadius:10, padding:"8px 0", cursor:"pointer",
              background: billing===b ? C.terra : "transparent",
              color:"#fff", fontSize:13, fontWeight:600, position:"relative",
            }}>
              {b === "yearly" ? "Yearly" : "Monthly"}
              {b === "yearly" && (
                <span style={{
                  position:"absolute", top:-8, right:4, background:C.gold,
                  color:C.espresso, fontSize:9, fontWeight:700, padding:"2px 6px",
                  borderRadius:10,
                }}>SAVE {savings}%</span>
              )}
            </button>
          ))}
        </div>

        {/* Price cards */}
        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          <div onClick={() => setBilling("monthly")} style={{
            flex:1, borderRadius:14, padding:"16px 14px", cursor:"pointer",
            border: billing==="monthly" ? `2px solid ${C.terra}` : "2px solid rgba(255,255,255,0.15)",
            background: billing==="monthly" ? "rgba(196,98,45,0.15)" : "rgba(255,255,255,0.05)",
          }}>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em" }}>Monthly</div>
            <div style={{ color:"#fff", fontSize:26, fontWeight:700, marginTop:4 }}>${monthly}<span style={{ fontSize:13, fontWeight:400 }}>/mo</span></div>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, marginTop:4 }}>Billed monthly</div>
          </div>
          <div onClick={() => setBilling("yearly")} style={{
            flex:1, borderRadius:14, padding:"16px 14px", cursor:"pointer",
            border: billing==="yearly" ? `2px solid ${C.gold}` : "2px solid rgba(255,255,255,0.15)",
            background: billing==="yearly" ? "rgba(212,168,71,0.15)" : "rgba(255,255,255,0.05)",
            position:"relative",
          }}>
            {billing==="yearly" && (
              <div style={{
                position:"absolute", top:-10, right:10, background:C.gold,
                color:C.espresso, fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:10,
              }}>BEST VALUE</div>
            )}
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em" }}>Yearly</div>
            <div style={{ color:"#fff", fontSize:26, fontWeight:700, marginTop:4 }}>${perMonth}<span style={{ fontSize:13, fontWeight:400 }}>/mo</span></div>
            <div style={{ color:C.gold, fontSize:11, marginTop:4 }}>${yearly}/yr · Save ${(monthly*12-yearly).toFixed(2)}</div>
          </div>
        </div>

        {/* Feature list */}
        <div style={{ marginBottom:20 }}>
          {[
            ["🎤","Voice ingredient capture"],
            ["📷","Photo scan of fridge/food"],
            ["🔢","Full macro & calorie tracker"],
            ["💊","Micronutrients per recipe"],
            ["📊","Weekly nutrition report"],
            ["♾️","Unlimited saved favorites"],
            ["🎯","Goal-based meal planning"],
          ].map(([icon, label]) => (
            <div key={label} style={{
              display:"flex", alignItems:"center", gap:10, paddingBottom:10,
              borderBottom:"1px solid rgba(255,255,255,0.07)",
            }}>
              <span style={{ fontSize:18 }}>{icon}</span>
              <span style={{ color:"rgba(255,255,255,0.85)", fontSize:13 }}>{label}</span>
              <span style={{ marginLeft:"auto", color:C.gold, fontSize:14 }}>✓</span>
            </div>
          ))}
        </div>

        <button onClick={() => onUpgrade(billing)} style={{
          width:"100%", background:`linear-gradient(135deg,${C.terra},${C.terraDeep})`,
          color:"#fff", border:"none", borderRadius:14, padding:"15px",
          fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:10,
        }}>
          {billing==="yearly" ? `Start for $${perMonth}/mo · Billed $${yearly}/yr` : `Start for $${monthly}/month`}
        </button>
        <div style={{ textAlign:"center", color:"rgba(255,255,255,0.4)", fontSize:11 }}>
          7-day free trial · Cancel anytime · No hidden fees
        </div>
      </div>
    </div>
  );
}

// ─── Premium Lock Prompt ──────────────────────────────────────
function PremiumLock({ label, onUpgrade }) {
  return (
    <div style={{
      background: C.terraLight, borderRadius:12, padding:"12px 14px",
      display:"flex", alignItems:"center", gap:12, marginBottom:10,
      border:`1px solid ${C.border}`,
    }}>
      <span style={{ fontSize:22 }}>🔒</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.espresso }}>{label}</div>
        <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Available with Premium</div>
      </div>
      <button onClick={onUpgrade} style={{
        background:C.terra, color:"#fff", border:"none",
        borderRadius:10, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer",
      }}>Upgrade</button>
    </div>
  );
}

// ─── Nutrition Bar ────────────────────────────────────────────
function NutritionBar({ label, value, unit, color, max }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ fontSize:11, color:C.muted, fontWeight:600 }}>{label}</span>
        <span style={{ fontSize:11, color:C.espresso, fontWeight:700 }}>{value}{unit}</span>
      </div>
      <div style={{ height:4, background:"#EDE0D0", borderRadius:4 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:4 }} />
      </div>
    </div>
  );
}

// ─── Recipe Card ──────────────────────────────────────────────
function RecipeCard({ recipe, onSave, saved, isPremium, onUpgrade }) {
  const [open, setOpen] = useState(false);
  const nutrition = recipe.nutrition;

  return (
    <div style={{
      background:C.cardBg, borderRadius:18, border:`1px solid ${C.border}`,
      overflow:"hidden", marginBottom:12,
      boxShadow:"0 2px 14px rgba(44,26,14,0.06)",
    }}>
      <div onClick={() => setOpen(!open)} style={{
        padding:"16px", cursor:"pointer",
        display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10,
      }}>
        <div style={{ flex:1 }}>
          <div style={{
            fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700,
            color:C.espresso, lineHeight:1.3,
          }}>{recipe.name}</div>
          <div style={{ fontSize:12, color:C.muted, marginTop:4, display:"flex", gap:12 }}>
            <span>⏱ {recipe.prepTime}</span>
            <span>· {recipe.difficulty || "Easy"}</span>
          </div>
          {isPremium && nutrition && (
            <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
              {[
                { label:"cal", value:nutrition.calories, bg:"#FFF3E0", color:C.terra },
                { label:"prot", value:`${nutrition.protein}g`, bg:"#E8F5E9", color:"#2E7D32" },
                { label:"carbs", value:`${nutrition.carbs}g`, bg:"#E3F2FD", color:"#1565C0" },
                { label:"fat", value:`${nutrition.fat}g`, bg:"#F3E5F5", color:"#6A1B9A" },
              ].map(n => (
                <div key={n.label} style={{
                  background:n.bg, borderRadius:8, padding:"3px 8px",
                  fontSize:11, fontWeight:700, color:n.color,
                }}>{n.value} <span style={{ fontWeight:400, opacity:0.7 }}>{n.label}</span></div>
              ))}
            </div>
          )}
          {!isPremium && (
            <button onClick={(e) => { e.stopPropagation(); onUpgrade(); }} style={{
              marginTop:8, background:"none", border:`1px solid ${C.terra}`,
              color:C.terra, borderRadius:8, padding:"3px 10px", fontSize:11,
              fontWeight:600, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4,
            }}>🔒 Unlock nutrition</button>
          )}
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
          <button onClick={(e) => { e.stopPropagation(); onSave(recipe); }} style={{
            background: saved ? "#FFCDD2" : C.terraLight,
            border:"none", borderRadius:20, width:36, height:36, cursor:"pointer", fontSize:16,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>{saved ? "❤️" : "🤍"}</button>
          <span style={{ color:C.border, fontSize:20, lineHeight:1 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <div style={{ padding:"0 16px 16px", borderTop:`1px solid ${C.border}` }}>
          {isPremium && nutrition && (
            <div style={{
              background:C.cream, borderRadius:12, padding:"12px 14px", margin:"14px 0 4px",
              border:`1px solid ${C.border}`,
            }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.terra, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>
                Nutrition (per serving)
              </div>
              <NutritionBar label="Calories" value={nutrition.calories} unit=" kcal" color={C.terra} max={800} />
              <NutritionBar label="Protein"  value={nutrition.protein}  unit="g"    color="#4CAF50" max={60}  />
              <NutritionBar label="Carbs"    value={nutrition.carbs}    unit="g"    color="#2196F3" max={100} />
              <NutritionBar label="Fat"      value={nutrition.fat}      unit="g"    color="#9C27B0" max={50}  />
            </div>
          )}
          <CardSection label="Ingredients">
            <ul style={{ margin:0, paddingLeft:18 }}>
              {recipe.ingredients?.map((ing,i) => (
                <li key={i} style={{ fontSize:13, color:"#555", marginBottom:4 }}>{ing}</li>
              ))}
            </ul>
          </CardSection>
          <CardSection label="Steps">
            {recipe.steps?.map((step,i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
                <span style={{
                  minWidth:24, height:24, background:C.terra, color:"#fff",
                  borderRadius:"50%", fontSize:11, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                }}>{i+1}</span>
                <span style={{ fontSize:13, color:"#444", lineHeight:1.6 }}>{step}</span>
              </div>
            ))}
          </CardSection>
          {recipe.missingIngredients?.length > 0 && (
            <InfoBox bg="#FFF8E1" labelColor="#F57F17" label="⚠️ You may need">
              {recipe.missingIngredients.join(", ")}
            </InfoBox>
          )}
          {recipe.substitutions && (
            <InfoBox bg="#E8F5E9" labelColor="#2E7D32" label="💡 Substitutions">
              {recipe.substitutions}
            </InfoBox>
          )}
        </div>
      )}
    </div>
  );
}

function CardSection({ label, children }) {
  return (
    <div style={{ marginTop:14 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.terra, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>{label}</div>
      {children}
    </div>
  );
}

function InfoBox({ bg, labelColor, label, children }) {
  return (
    <div style={{ marginTop:12, background:bg, borderRadius:10, padding:"10px 14px" }}>
      <div style={{ fontSize:12, fontWeight:700, color:labelColor, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:13, color:"#555" }}>{children}</div>
    </div>
  );
}

function MainButton({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", border:"none", borderRadius:16, padding:"16px",
      fontSize:15, fontWeight:700, letterSpacing:"0.02em",
      background: disabled ? "#D4C4B4" : `linear-gradient(135deg,${C.terra},${C.terraDeep})`,
      color: disabled ? C.muted : "#fff", cursor: disabled ? "not-allowed" : "pointer",
      marginBottom:16, transition:"all 0.2s",
      boxShadow: disabled ? "none" : "0 4px 16px rgba(196,98,45,0.3)",
    }}>{children}</button>
  );
}

// ─── Header ───────────────────────────────────────────────────
function AppHeader({ user, signIn, logOut, isPremium, onOpenPremium }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div style={{
      background:C.espresso, padding:"44px 20px 20px",
      borderRadius:"0 0 28px 28px",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, color:"#fff", fontWeight:700 }}>
          FridgeChef
          <span style={{ color:C.terra, marginLeft:4 }}>🍳</span>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {isPremium ? (
            <div style={{
              background:C.gold, color:C.espresso, borderRadius:20,
              padding:"4px 12px", fontSize:12, fontWeight:700,
              display:"flex", alignItems:"center", gap:5,
            }}>👑 PRO</div>
          ) : (
            <button onClick={onOpenPremium} style={{
              background:"rgba(196,98,45,0.25)", color:C.terra, border:`1px solid ${C.terra}`,
              borderRadius:20, padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer",
            }}>✨ Upgrade</button>
          )}
          <div style={{ position:"relative" }}>
            <div onClick={() => setMenuOpen(!menuOpen)} style={{
              width:36, height:36, borderRadius:"50%", cursor:"pointer",
              background: user ? C.terra : "rgba(255,255,255,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:user ? 15 : 18, fontWeight:700,
            }}>
              {user ? (user.displayName?.[0] || "U") : "👤"}
            </div>
            {menuOpen && (
              <div style={{
                position:"absolute", right:0, top:44, background:"#fff",
                borderRadius:14, boxShadow:"0 8px 32px rgba(44,26,14,0.2)",
                minWidth:180, zIndex:100, overflow:"hidden",
              }}>
                {user ? (
                  <>
                    <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:13, fontWeight:600, color:C.espresso }}>
                        {user.displayName || "Chef"}
                      </div>
                      <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{user.email}</div>
                    </div>
                    <button onClick={() => { logOut(); setMenuOpen(false); }} style={{
                      width:"100%", textAlign:"left", padding:"12px 16px", border:"none",
                      background:"none", cursor:"pointer", fontSize:13, color:"#c62828",
                    }}>Sign out</button>
                  </>
                ) : (
                  <button onClick={() => { signIn(); setMenuOpen(false); }} style={{
                    width:"100%", textAlign:"left", padding:"14px 16px", border:"none",
                    background:"none", cursor:"pointer", fontSize:14, color:C.espresso, fontWeight:600,
                  }}>Sign in with Google →</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ color:"rgba(255,255,255,0.55)", fontSize:13, marginTop:6 }}>
        Cook smart with what you have
      </div>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────
function TabBar({ tab, setTab }) {
  return (
    <div style={{
      display:"flex", background:C.cardBg, margin:"12px 16px 0",
      borderRadius:18, padding:5, gap:2,
      boxShadow:"0 2px 16px rgba(44,26,14,0.08)",
      position:"sticky", top:8, zIndex:10,
    }}>
      {TABS.map(t => (
        <button key={t} onClick={() => setTab(t)} style={{
          flex:1, border:"none", cursor:"pointer", borderRadius:13, padding:"8px 4px",
          fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em",
          background: tab===t ? C.terra : "transparent",
          color: tab===t ? "#fff" : C.muted,
          transition:"all 0.2s",
        }}>
          <div style={{ fontSize:20, marginBottom:3 }}>{TAB_ICONS[t]}</div>
          <div>{TAB_LABELS[t]}</div>
        </button>
      ))}
    </div>
  );
}

// ─── Ingredient Chip ──────────────────────────────────────────
function IngredientChip({ label, onRemove }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      background:C.terraLight, color:C.terra, border:`1px solid ${C.border}`,
      borderRadius:20, padding:"5px 12px", fontSize:13, fontWeight:500,
    }}>
      {label}
      <button onClick={onRemove} style={{
        background:"none", border:"none", cursor:"pointer",
        color:C.terra, fontSize:16, lineHeight:1, padding:0,
      }}>×</button>
    </span>
  );
}

// ─── Main App ─────────────────────────────────────────────────
function FridgeChefApp() {
  const { user, signIn, logOut, authError, inAppBrowser } = useAuth();

  // Core state
  const [tab, setTab]             = useState("recipes");
  const [input, setInput]         = useState("");
  const [ingredients, setIngredients] = useState(["Chicken","Cabbage","Garlic"]);
  const [recipes, setRecipes]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [planner, setPlanner]     = useState({});
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [groceryList, setGroceryList] = useState({});
  const [groceryLoading, setGroceryLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [diet, setDiet]           = useState("any");
  const [maxTime, setMaxTime]     = useState("30");
  const [recipeError, setRecipeError] = useState("");
  const [plannerError, setPlannerError] = useState("");

  // Premium & feature state
  const [isPremium, setIsPremium]     = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [listening, setListening]     = useState(false);
  const [handsFree, setHandsFree]     = useState(false);
  const [voiceIngredient, setVoiceIngredient] = useState("");

  const inputRef   = useRef();
  const intervalRef = useRef();
  const recognitionRef = useRef(null);

  // Load from Firestore + check premium status
  useEffect(() => {
    if (!user) return;
    getFavorites(user.uid).then(setFavorites).catch(console.error);
    getMealPlan(user.uid).then(setPlanner).catch(console.error);
    getPremiumStatus(user.uid).then(setIsPremium).catch(console.error);
  }, [user]);

  // ── Ingredients ──────────────────────────────────────────────
  const addIngredient = () => {
    const val = input.trim();
    if (val && !ingredients.map(s=>s.toLowerCase()).includes(val.toLowerCase())) {
      setIngredients(prev => [...prev, val]);
    }
    setInput("");
    inputRef.current?.focus();
  };
  const removeIngredient = (i) => setIngredients(prev => prev.filter((_,idx) => idx !== i));

  // ── Voice capture (Premium) ───────────────────────────────────
  const startVoice = useCallback((continuous = false) => {
    if (!isPremium) { setShowPremium(true); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice not supported in this browser. Try Chrome."); return; }
    const addVoice = (val) => {
      const v = val.trim();
      if (!v) return;
      setIngredients(prev => {
        if (prev.map(s=>s.toLowerCase()).includes(v.toLowerCase())) return prev;
        return [...prev, v.charAt(0).toUpperCase() + v.slice(1)];
      });
    };
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.onstart = () => setListening(true);
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join(" ").trim();
      if (continuous) {
        setVoiceIngredient(transcript);
        if (e.results[e.results.length-1].isFinal) {
          const words = transcript.split(/[,.\s]+/).filter(Boolean);
          if (words[words.length-1]?.toLowerCase() === "done") {
            words.slice(0,-1).forEach(addVoice);
            rec.stop();
          } else {
            words.forEach(addVoice);
            setVoiceIngredient("");
          }
        }
      } else {
        setVoiceIngredient(transcript);
        if (e.results[e.results.length-1].isFinal) {
          addVoice(transcript);
          setVoiceIngredient("");
          rec.stop();
        }
      }
    };
    rec.onerror = () => { setListening(false); setVoiceIngredient(""); };
    rec.onend   = () => { setListening(false); setHandsFree(false); setVoiceIngredient(""); };
    recognitionRef.current = rec;
    rec.start();
  }, [isPremium]);

  // ── Stripe checkout ───────────────────────────────────────────
  const handleUpgrade = async (billing) => {
    if (!user) {
      // Prompt sign in first
      signIn();
      setShowPremium(false);
      return;
    }
    const priceId = billing === "yearly"
      ? process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
    if (!priceId) {
      alert("Stripe is not configured yet. Please add price IDs to environment variables.");
      return;
    }
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: user.uid, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Checkout failed: " + (data.error || "unknown error"));
    } catch(err) {
      alert("Checkout failed: " + err.message);
    }
  };

  // ── Photo scan (Premium — real Claude vision) ─────────────────
  const [scanning, setScanning] = useState(false);
  const handlePhotoScan = () => {
    if (!isPremium) { setShowPremium(true); return; }
    const fileInput = document.createElement("input");
    fileInput.type = "file"; fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setScanning(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(",")[1];
          const mediaType = file.type || "image/jpeg";
          const res = await fetch("/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64, mediaType }),
          });
          const data = await res.json();
          if (data.ingredients?.length) {
            const toAdd = data.ingredients.filter(
              s => !ingredients.map(x=>x.toLowerCase()).includes(s.toLowerCase())
            );
            if (toAdd.length) setIngredients(prev => [...prev, ...toAdd]);
          }
        };
        reader.readAsDataURL(file);
      } catch(err) {
        console.error("Scan error:", err);
      } finally {
        setScanning(false);
      }
    };
    fileInput.click();
  };

  // ── Recipe generation ─────────────────────────────────────────
  const generateRecipes = async () => {
    if (!ingredients.length) return;
    setLoading(true); setRecipes([]); setRecipeError("");
    const msgs = ["Checking your fridge…","Finding perfect recipes…","Almost ready!"];
    let mi = 0; setLoadingMsg(msgs[0]);
    intervalRef.current = setInterval(() => { mi=(mi+1)%msgs.length; setLoadingMsg(msgs[mi]); }, 1500);
    try {
      const nutritionRequest = isPremium
        ? `Include "nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0} per serving for each recipe.`
        : "";
      const text = await callClaude(
        `I have: ${ingredients.join(", ")}. Diet: ${diet}. Max time: ${maxTime} min.
Return a JSON array of exactly 3 recipes. Each item MUST follow this format exactly:
{"name":"","prepTime":"","difficulty":"Easy","ingredients":[],"steps":[],"missingIngredients":[],"substitutions":"${isPremium ? `","nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0}` : '"'}
${nutritionRequest}
Budget-friendly. Use provided ingredients. Return ONLY the JSON array, no markdown.`,
        "You are a home chef AI. Return ONLY valid JSON with no markdown or explanation."
      );
      const parsed = parseJSON(text);
      if (Array.isArray(parsed)) setRecipes(parsed);
      else if (parsed) setRecipes([parsed]);
      else setRecipeError("Couldn't parse recipes — please try again.");
    } catch(e) {
      setRecipeError("Something went wrong. Check connection and try again.");
    }
    clearInterval(intervalRef.current); setLoading(false);
  };

  // ── Favorites ─────────────────────────────────────────────────
  const toggleFavorite = async (recipe) => {
    const exists = favorites.find(r => r.name === recipe.name);
    const next = exists ? favorites.filter(r=>r.name!==recipe.name) : [...favorites, recipe];
    setFavorites(next);
    if (user) {
      exists ? await removeFavorite(user.uid, recipe) : await addFavorite(user.uid, recipe);
    }
  };
  const isFav = (r) => favorites.some(f => f.name === r.name);

  // ── Meal planner ──────────────────────────────────────────────
  const generateWeekPlan = async () => {
    if (!ingredients.length) return;
    setPlannerLoading(true); setPlannerError("");
    try {
      const text = await callClaude(
        `I have: ${ingredients.join(", ")}. Diet: ${diet}.
Create a weekly meal plan. Return ONLY this JSON (no extra text):
{"Mon":{"Breakfast":"","Lunch":"","Dinner":""},"Tue":{"Breakfast":"","Lunch":"","Dinner":""},"Wed":{"Breakfast":"","Lunch":"","Dinner":""},"Thu":{"Breakfast":"","Lunch":"","Dinner":""},"Fri":{"Breakfast":"","Lunch":"","Dinner":""},"Sat":{"Breakfast":"","Lunch":"","Dinner":""},"Sun":{"Breakfast":"","Lunch":"","Dinner":""}}
Use simple beginner-friendly meal names.`,
        "You are a meal planning AI. Return ONLY valid JSON."
      );
      const parsed = parseJSON(text);
      if (parsed) {
        setPlanner(parsed);
        if (user) await saveMealPlan(user.uid, parsed);
      } else {
        setPlannerError("Couldn't generate plan — please try again.");
      }
    } catch(e) {
      setPlannerError("Something went wrong. Please try again.");
    }
    setPlannerLoading(false);
  };

  // ── Grocery list ──────────────────────────────────────────────
  const generateGroceryList = async () => {
    setGroceryLoading(true);
    try {
      const want = favorites.map(r=>r.name).join(", ") || "a week of home cooking";
      const text = await callClaude(
        `I have: ${ingredients.join(", ")}. I want to cook: ${want}.
Return ONLY a JSON object of items to buy (things I don't already have):
{"Produce":[],"Proteins":[],"Pantry":[],"Dairy":[],"Other":[]}
Keep it budget-friendly.`,
        "You are a grocery list assistant. Return ONLY valid JSON."
      );
      const parsed = parseJSON(text);
      if (parsed) setGroceryList(parsed);
    } catch(e) { console.error(e); }
    setGroceryLoading(false);
  };

  const toggleCheck = (key) => setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:C.cream, paddingBottom:30 }}>

      {showPremium && (
        <PremiumModal
          onClose={() => setShowPremium(false)}
          onUpgrade={(billing) => {
            setShowPremium(false);
            handleUpgrade(billing);
          }}
        />
      )}

      <AppHeader
        user={user} signIn={signIn} logOut={logOut}
        isPremium={isPremium} onOpenPremium={() => setShowPremium(true)}
      />

      {/* In-app browser warning */}
      {inAppBrowser && (
        <div style={{
          margin:"12px 16px 0", background:"#FFF8E1", borderRadius:14,
          border:"1px solid #FFE082", padding:"14px 16px",
        }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#E65100", marginBottom:4 }}>
            🌐 Open in Chrome or Safari to sign in
          </div>
          <div style={{ fontSize:12, color:"#795548", lineHeight:1.5, marginBottom:10 }}>
            Google sign-in is blocked inside apps like Facebook and Instagram. Copy the link and open it in your browser.
          </div>
          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(() => alert("Link copied! Open it in Chrome or Safari."));
              }
            }}
            style={{
              background:"#E65100", color:"#fff", border:"none",
              borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer",
            }}
          >Copy link to open in browser</button>
        </div>
      )}

      {/* In-app browser sign-in error */}
      {authError === "in-app-browser" && (
        <div style={{
          margin:"8px 16px 0", background:"#FFF8E1", borderRadius:12,
          border:"1px solid #FFE082", padding:"12px 14px", fontSize:13, color:"#795548",
        }}>
          ⚠️ Google sign-in doesn&apos;t work inside this browser. Open <strong>fridgechef-sable-alpha.vercel.app</strong> in Chrome or Safari.
        </div>
      )}

      {/* Auth notice */}
      {!user && (
        <div style={{
          margin:"12px 16px 0", background:C.cardBg, borderRadius:14,
          border:`1px solid ${C.border}`, padding:"12px 16px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:C.espresso }}>Sign in to sync your data</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Save recipes & meal plans across devices</div>
          </div>
          <button onClick={signIn} style={{
            background:C.terra, color:"#fff", border:"none",
            borderRadius:10, padding:"8px 14px", fontSize:13, fontWeight:600, cursor:"pointer",
          }}>Sign in</button>
        </div>
      )}
      {authError && authError !== "in-app-browser" && (
        <div style={{ margin:"8px 16px 0", background:C.errorBg, borderRadius:10, padding:"10px 14px", fontSize:13, color:C.errorText }}>
          {authError}
        </div>
      )}

      <TabBar tab={tab} setTab={setTab} />

      <div style={{ padding:"16px 16px 0" }}>

        {/* ── RECIPES TAB ── */}
        {tab === "recipes" && (
          <div>
            {/* Diet filter chips */}
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Diet</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {DIET_OPTIONS.map(d => (
                  <button key={d.value} onClick={() => setDiet(d.value)} style={{
                    border:`1.5px solid ${diet===d.value ? C.terra : C.border}`,
                    borderRadius:20, padding:"6px 12px", fontSize:12, fontWeight:600,
                    background: diet===d.value ? C.terraLight : C.cardBg,
                    color: diet===d.value ? C.terra : C.muted,
                    cursor:"pointer",
                  }}>{d.icon} {d.label}</button>
                ))}
              </div>
            </div>

            {/* Time filter chips */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Time</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {TIME_OPTIONS.map(t => (
                  <button key={t.value} onClick={() => setMaxTime(t.value)} style={{
                    border:`1.5px solid ${maxTime===t.value ? C.terra : C.border}`,
                    borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:600,
                    background: maxTime===t.value ? C.terraLight : C.cardBg,
                    color: maxTime===t.value ? C.terra : C.muted,
                    cursor:"pointer",
                  }}>{t.icon} {t.label}</button>
                ))}
              </div>
            </div>

            {/* Ingredient box */}
            <div style={{
              background:C.cardBg, borderRadius:18, border:`1px solid ${C.border}`,
              padding:16, marginBottom:14,
              boxShadow:"0 2px 12px rgba(44,26,14,0.04)",
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                  Your ingredients
                </div>
                {ingredients.length > 0 && (
                  <button onClick={() => setIngredients([])} style={{
                    background:"none", border:`1px solid ${C.border}`, borderRadius:8,
                    padding:"3px 10px", fontSize:11, cursor:"pointer", color:C.muted,
                    fontWeight:600,
                  }}>Clear all</button>
                )}
              </div>

              {/* Input row */}
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <input
                  ref={inputRef}
                  value={voiceIngredient || input}
                  onChange={e => !listening && setInput(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && addIngredient()}
                  placeholder={listening ? "Listening…" : "e.g. chicken, garlic…"}
                  style={{
                    flex:1, border:`1.5px solid ${listening ? C.terra : C.border}`,
                    borderRadius:12, padding:"10px 12px", fontSize:14,
                    background: listening ? C.terraLight : C.cream, outline:"none",
                    color:C.espresso, transition:"all 0.2s",
                  }}
                />
                <button
                  onClick={() => isPremium ? startVoice(false) : setShowPremium(true)}
                  title={isPremium ? "Voice input" : "Premium: voice input"}
                  style={{
                    background: listening ? C.terra : (isPremium ? C.terraLight : "#f0ece8"),
                    border:`1.5px solid ${listening ? C.terra : C.border}`,
                    borderRadius:12, width:44, cursor:"pointer", fontSize:18,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    position:"relative",
                  }}
                >
                  🎤
                  {!isPremium && <span style={{ position:"absolute", top:2, right:2, fontSize:8 }}>🔒</span>}
                </button>
                <button onClick={addIngredient} style={{
                  background:C.terra, color:"#fff", border:"none",
                  borderRadius:12, width:44, fontSize:22, cursor:"pointer", fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>+</button>
              </div>

              {/* Photo scan + Hands-free */}
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                <button onClick={handlePhotoScan} disabled={scanning} style={{
                  flex:1, background: isPremium ? C.cream : "#f0ece8",
                  border:`1.5px solid ${scanning ? C.terra : C.border}`, borderRadius:12, padding:"9px 0",
                  fontSize:13, fontWeight:600, cursor: scanning ? "wait" : "pointer",
                  color: isPremium ? C.espresso : C.muted,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                }}>
                  {scanning ? "🔍 Scanning…" : "📷 Photo scan"}
                  {!isPremium && !scanning && <span style={{ fontSize:10 }}>🔒</span>}
                </button>
                <button onClick={() => {
                  if (!isPremium) { setShowPremium(true); return; }
                  setHandsFree(true); startVoice(true);
                }} style={{
                  flex:1, background: handsFree ? C.terraLight : (isPremium ? C.cream : "#f0ece8"),
                  border:`1.5px solid ${handsFree ? C.terra : C.border}`, borderRadius:12, padding:"9px 0",
                  fontSize:13, fontWeight:600, cursor:"pointer",
                  color: handsFree ? C.terra : (isPremium ? C.espresso : C.muted),
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                }}>
                  🗣 Hands-free
                  {!isPremium && <span style={{ fontSize:10 }}>🔒</span>}
                </button>
              </div>

              {handsFree && listening && (
                <div style={{
                  background:C.terraLight, borderRadius:10, padding:"8px 12px",
                  fontSize:12, color:C.terra, fontWeight:600, marginBottom:10,
                  display:"flex", alignItems:"center", gap:8,
                }}>
                  <span style={{ animation:"pulse 1s infinite" }}>🔴</span>
                  Say ingredients one at a time · Say &quot;done&quot; to stop
                </div>
              )}

              {/* Ingredient chips */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, minHeight:30 }}>
                {ingredients.map((ing,i) => (
                  <IngredientChip key={i} label={ing} onRemove={() => removeIngredient(i)} />
                ))}
              </div>
            </div>

            <MainButton onClick={generateRecipes} disabled={loading || !ingredients.length}>
              {loading ? loadingMsg : `✨ Generate Recipes (${ingredients.length} ingredients)`}
            </MainButton>

            {recipeError && (
              <div style={{ background:C.errorBg, borderRadius:12, padding:"12px 16px", marginBottom:12, fontSize:13, color:C.errorText }}>
                {recipeError}
              </div>
            )}

            {recipes.map((r,i) => (
              <RecipeCard
                key={i} recipe={r}
                onSave={toggleFavorite} saved={isFav(r)}
                isPremium={isPremium} onUpgrade={() => setShowPremium(true)}
              />
            ))}

            {!loading && !recipes.length && !recipeError && (
              <div style={{ textAlign:"center", padding:"50px 0", color:C.border }}>
                <div style={{ fontSize:56 }}>🧅</div>
                <div style={{ fontSize:15, marginTop:10, color:C.muted }}>Add ingredients &amp; generate!</div>
                <div style={{ fontSize:12, color:C.border, marginTop:6 }}>
                  Type ingredients above, then tap Generate
                </div>
              </div>
            )}

            {/* Premium upsell (if free) */}
            {!isPremium && (
              <div style={{
                background:C.espresso, borderRadius:20, padding:"20px", marginTop:8,
                textAlign:"center",
              }}>
                <div style={{ fontSize:28, marginBottom:8 }}>👑</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:C.gold, fontWeight:700, marginBottom:6 }}>
                  Unlock Premium
                </div>
                <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, marginBottom:14, lineHeight:1.6 }}>
                  Voice input · Photo scan · Full macros & nutrition · Goal-based meal planning
                </div>
                <button onClick={() => setShowPremium(true)} style={{
                  background:`linear-gradient(135deg,${C.terra},${C.terraDeep})`,
                  color:"#fff", border:"none", borderRadius:14, padding:"12px 28px",
                  fontSize:14, fontWeight:700, cursor:"pointer",
                }}>See plans · from $8.99/mo</button>
              </div>
            )}
          </div>
        )}

        {/* ── PLANNER TAB ── */}
        {tab === "planner" && (
          <div>
            <MainButton onClick={generateWeekPlan} disabled={plannerLoading || !ingredients.length}>
              {plannerLoading ? "Planning your week…" : "📅 Generate Week Plan"}
            </MainButton>
            {!user && (
              <div style={{
                background:C.cardBg, borderRadius:12, padding:"12px 14px", marginBottom:14,
                border:`1px solid ${C.border}`, fontSize:13, color:C.muted,
              }}>
                💡 Sign in to save your meal plan across devices
              </div>
            )}
            {plannerError && (
              <div style={{ background:C.errorBg, borderRadius:12, padding:"12px 14px", marginBottom:12, fontSize:13, color:C.errorText }}>
                {plannerError}
              </div>
            )}
            {Object.keys(planner).length > 0 ? (
              DAYS.map(day => (
                <div key={day} style={{
                  background:C.cardBg, borderRadius:16, border:`1px solid ${C.border}`,
                  marginBottom:12, overflow:"hidden",
                  boxShadow:"0 2px 10px rgba(44,26,14,0.05)",
                }}>
                  <div style={{
                    background:C.terra, color:"#fff", padding:"10px 16px",
                    fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700,
                  }}>{DAY_NAMES[day]}</div>
                  {MEALS.map((meal,mi) => {
                    const mealColors = {
                      Breakfast:{ bg:"#FFF8F0", text:C.terra },
                      Lunch:{ bg:"#F0F7F0", text:"#2E7D32" },
                      Dinner:{ bg:"#F0F4FF", text:"#1565C0" },
                    };
                    return (
                      <div key={meal} style={{
                        padding:"11px 16px", display:"flex", gap:10, alignItems:"center",
                        borderBottom: mi < 2 ? `1px solid ${C.cream}` : "none",
                      }}>
                        <span style={{
                          fontSize:11, fontWeight:700, color:mealColors[meal].text,
                          background:mealColors[meal].bg, padding:"3px 10px",
                          borderRadius:20, minWidth:64, textAlign:"center",
                        }}>{meal}</span>
                        <span style={{ fontSize:13, color:C.espresso }}>{planner[day]?.[meal] || "—"}</span>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div style={{ textAlign:"center", padding:"50px 0" }}>
                <div style={{ fontSize:52 }}>📅</div>
                <div style={{ fontSize:14, marginTop:10, color:C.muted }}>Add ingredients then generate a plan</div>
              </div>
            )}
          </div>
        )}

        {/* ── FAVORITES TAB ── */}
        {tab === "favorites" && (
          <div>
            {favorites.length > 0 ? (
              <>
                <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>
                  {favorites.length} saved recipe{favorites.length!==1?"s":""}
                  {!user && " · Sign in to sync across devices"}
                </div>
                {favorites.map((r,i) => (
                  <RecipeCard
                    key={i} recipe={r}
                    onSave={toggleFavorite} saved={true}
                    isPremium={isPremium} onUpgrade={() => setShowPremium(true)}
                  />
                ))}
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"50px 0" }}>
                <div style={{ fontSize:52 }}>❤️</div>
                <div style={{ fontSize:14, marginTop:10, color:C.muted }}>Tap 🤍 on any recipe to save it here</div>
              </div>
            )}
          </div>
        )}

        {/* ── GROCERY TAB ── */}
        {tab === "grocery" && (
          <div>
            <MainButton onClick={generateGroceryList} disabled={groceryLoading}>
              {groceryLoading ? "Building your list…" : "🛒 Generate Grocery List"}
            </MainButton>
            {Object.keys(groceryList).length > 0 && (
              <div style={{ marginBottom:12, textAlign:"right" }}>
                <button onClick={() => setCheckedItems({})} style={{
                  background:"none", border:`1px solid ${C.border}`, borderRadius:10,
                  padding:"5px 12px", fontSize:12, cursor:"pointer", color:C.muted,
                }}>Clear all checks</button>
              </div>
            )}
            {Object.keys(groceryList).length > 0 ? (
              Object.entries(groceryList).map(([cat, items]) =>
                Array.isArray(items) && items.length > 0 && (
                  <div key={cat} style={{
                    background:C.cardBg, borderRadius:16, border:`1px solid ${C.border}`,
                    marginBottom:12, overflow:"hidden",
                    boxShadow:"0 2px 10px rgba(44,26,14,0.05)",
                  }}>
                    <div style={{
                      padding:"10px 16px", background:C.terraLight,
                      fontWeight:700, fontSize:13, color:C.terra,
                      borderBottom:`1px solid ${C.border}`,
                    }}>{cat}</div>
                    {items.map((item,i) => {
                      const key = `${cat}-${i}`;
                      const done = checkedItems[key];
                      return (
                        <div key={i} onClick={() => toggleCheck(key)} style={{
                          padding:"12px 16px", display:"flex", alignItems:"center", gap:12,
                          borderBottom: i<items.length-1 ? `1px solid ${C.cream}` : "none",
                          cursor:"pointer",
                        }}>
                          <div style={{
                            width:22, height:22, borderRadius:7, flexShrink:0,
                            border: done ? "none" : `2px solid ${C.border}`,
                            background: done ? C.terra : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center",
                          }}>
                            {done && <span style={{ color:"#fff", fontSize:12, fontWeight:700 }}>✓</span>}
                          </div>
                          <span style={{
                            fontSize:14, color: done ? C.muted : C.espresso,
                            textDecoration: done ? "line-through" : "none",
                          }}>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                )
              )
            ) : (
              <div style={{ textAlign:"center", padding:"50px 0" }}>
                <div style={{ fontSize:52 }}>🛒</div>
                <div style={{ fontSize:14, marginTop:10, color:C.muted }}>
                  {favorites.length ? "Generate a list based on your saved recipes" : "Save some favorites first, then generate a grocery list"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────
export default function Page() {
  return (
    <AuthProvider>
      <FridgeChefApp />
    </AuthProvider>
  );
}
