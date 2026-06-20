"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { AuthProvider, useAuth } from "../components/AuthContext";
import { getFavorites, addFavorite, removeFavorite, getMealPlan, saveMealPlan, getUserStatus } from "../lib/db";
import { CURRENCIES, getCurrencyForCountry } from "../lib/currencies";

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
const CUISINE_OPTIONS = [
  { value:"any",      label:"🌍 Any" },
  { value:"filipino", label:"🇵🇭 Filipino" },
  { value:"indian",   label:"🇮🇳 Indian" },
  { value:"korean",   label:"🇰🇷 Korean" },
  { value:"chinese",  label:"🇨🇳 Chinese" },
  { value:"japanese", label:"🇯🇵 Japanese" },
  { value:"american", label:"🇺🇸 American" },
  { value:"italian",  label:"🇮🇹 Italian" },
  { value:"mexican",  label:"🇲🇽 Mexican" },
  { value:"thai",     label:"🇹🇭 Thai" },
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

// ─── Currency config ──────────────────────────────────────────

// ─── Premium Modal ────────────────────────────────────────────
function PremiumModal({ onClose, onUpgrade, initialCurrency }) {
  const [billing, setBilling] = useState("yearly");
  const currency = initialCurrency || CURRENCIES.DEFAULT;

  const { symbol, monthly, yearly, monthlyId, yearlyId } = currency;
  const perMonth = (yearly / 12).toFixed(billing === "yearly" && yearly < 100 ? 0 : 2);
  const savings  = Math.round((1 - yearly / (monthly * 12)) * 100);
  const priceId  = billing === "yearly" ? yearlyId : monthlyId;

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
            <div style={{ color:"#fff", fontSize:26, fontWeight:700, marginTop:4 }}>{symbol}{monthly}<span style={{ fontSize:13, fontWeight:400 }}>/mo</span></div>
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
            <div style={{ color:"#fff", fontSize:26, fontWeight:700, marginTop:4 }}>{symbol}{perMonth}<span style={{ fontSize:13, fontWeight:400 }}>/mo</span></div>
            <div style={{ color:C.gold, fontSize:11, marginTop:4 }}>{symbol}{yearly}/yr · Save {savings}%</div>
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

        {/* Reviews */}
        <div style={{ marginBottom:20 }}>
          <div style={{ textAlign:"center", color:"rgba(255,255,255,0.5)", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>
            What people say
          </div>
          {[
            { name:"Sarah M.", role:"Fitness Coach", text:"The macro tracker alone is worth it. I hit my protein goal every day for 3 months.", stars:5 },
            { name:"James K.", role:"Busy Dad",      text:"Photo scan is magic. I point at my fridge and have a meal plan in 10 seconds.", stars:5 },
            { name:"Priya R.", role:"Budget Cook",   text:"Leftover reuse feature saves me $80 a month on groceries. No joke.", stars:5 },
          ].map((r) => (
            <div key={r.name} style={{
              background:"rgba(255,255,255,0.06)", borderRadius:14, padding:"12px 14px",
              marginBottom:10, border:"1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ color:C.gold, fontSize:13, marginBottom:6 }}>★★★★★</div>
              <div style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.5, marginBottom:8 }}>
                &ldquo;{r.text}&rdquo;
              </div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                {r.name} — {r.role}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => onUpgrade(priceId)} style={{
          width:"100%", background:`linear-gradient(135deg,${C.terra},${C.terraDeep})`,
          color:"#fff", border:"none", borderRadius:14, padding:"15px",
          fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:10,
          boxShadow:"0 4px 20px rgba(196,98,45,0.4)",
        }}>
          Start free · {symbol}{billing==="yearly" ? perMonth : monthly}/mo after trial
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
function RecipeIngredientRow({ text }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:8, paddingLeft:4 }}>
      <span style={{ color:C.terra, fontSize:14, marginTop:1, flexShrink:0 }}>•</span>
      <span style={{ fontSize:13, color:"#555", lineHeight:1.5 }}>{text}</span>
    </div>
  );
}

async function fetchDishPhoto(name) {
  // 1. TheMealDB — real photos for thousands of global dishes
  try {
    const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`);
    const d = await r.json();
    if (d.meals?.[0]?.strMealThumb) return d.meals[0].strMealThumb + "/preview";
  } catch {}

  // 2. Wikipedia REST API — real photos for well-known dishes (Adobo, Sinigang, Ramen, etc.)
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
    const d = await r.json();
    if (d.thumbnail?.source) return d.thumbnail.source;
  } catch {}

  // 3. LoremFlickr — real Flickr food photos as last resort
  return `https://loremflickr.com/200/200/${encodeURIComponent(name)},food,dish/all`;
}

function DishPhoto({ name, size = 80 }) {
  const [src, setSrc]   = useState(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!name) return;
    fetchDishPhoto(name).then(url => { setSrc(url); setTried(true); });
  }, [name]);

  const boxStyle = { width:size, height:size, borderRadius:14, flexShrink:0, overflow:"hidden", background:C.terraLight };

  if (!tried) return (
    <div style={{ ...boxStyle, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:22, height:22, borderRadius:"50%", border:`3px solid ${C.terra}`, borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!src) return <div style={{ ...boxStyle, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>🍽️</div>;

  return <img src={src} alt={name} style={{ ...boxStyle, objectFit:"cover", display:"block", width:size, height:size }} />;
}

function RecipeCard({ recipe, onSave, saved, isPremium, onUpgrade }) {
  const [open, setOpen]   = useState(false);
  const nutrition         = recipe.nutrition;

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
          {isUnlocked && nutrition && (
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
          {!isUnlocked && (
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
          {isUnlocked && nutrition && (
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
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {recipe.ingredients?.map((ing,i) => (
                <RecipeIngredientRow key={i} text={ing} />
              ))}
            </div>
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
function AppHeader({ user, signIn, logOut, isPremium, onOpenPremium, currency = CURRENCIES.DEFAULT }) {
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
          {isUnlocked ? (
            <div style={{
              background:C.gold, color:C.espresso, borderRadius:20,
              padding:"4px 12px", fontSize:12, fontWeight:700,
              display:"flex", alignItems:"center", gap:5,
            }}>👑 PRO</div>
          ) : null}
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
function ingredientImgUrl(label) {
  // TheMealDB has a free ingredient image library — no API key needed
  const name = label.trim().replace(/\s+/g, "%20");
  return `https://www.themealdb.com/images/ingredients/${name}-Small.png`;
}

function IngredientChip({ label, onRemove }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      background:C.terraLight, color:C.terra, border:`1px solid ${C.border}`,
      borderRadius:20, padding:"4px 10px 4px 4px", fontSize:13, fontWeight:500,
    }}>
      {imgOk ? (
        <img
          src={ingredientImgUrl(label)}
          alt=""
          onError={() => setImgOk(false)}
          style={{ width:26, height:26, borderRadius:"50%", objectFit:"cover", flexShrink:0, background:"#fff" }}
        />
      ) : (
        <span style={{ fontSize:16, flexShrink:0 }}>🥬</span>
      )}
      {label}
      <button onClick={onRemove} style={{
        background:"none", border:"none", cursor:"pointer",
        color:C.terra, fontSize:16, lineHeight:1, padding:0,
      }}>×</button>
    </span>
  );
}

// ─── Trial Banner ─────────────────────────────────────────────
function TrialBanner({ daysLeft, onUpgrade }) {
  const urgent = daysLeft <= 1;
  const bg     = urgent ? "#B71C1C" : "#E65100";
  const msg    = daysLeft === 0
    ? "⏰ Your free trial ends today!"
    : daysLeft === 1
    ? "⏰ Last day of your free trial!"
    : `🎉 ${daysLeft} days left in your free trial`;

  return (
    <div style={{
      background: bg, color: "#fff", padding: "10px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 10, flexShrink: 0,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{msg}</span>
      <button onClick={onUpgrade} style={{
        background: "#fff", color: bg, border: "none",
        borderRadius: 20, padding: "6px 14px", fontSize: 12,
        fontWeight: 700, cursor: "pointer", flexShrink: 0,
      }}>Upgrade now</button>
    </div>
  );
}

// ─── Hard Paywall ──────────────────────────────────────────────
function HardPaywall({ onUpgrade, currency }) {
  const [billing, setBilling] = useState("yearly");
  const { symbol, monthly, yearly, monthlyId, yearlyId } = currency || { symbol:"$", monthly:4.99, yearly:39, monthlyId:"", yearlyId:"" };
  const perMonth = (yearly / 12).toFixed(2);
  const savings  = Math.round((1 - yearly / (monthly * 12)) * 100);
  const priceId  = billing === "yearly" ? yearlyId : monthlyId;

  const features = [
    ["🎤", "Voice ingredient capture"],
    ["📷", "AI photo scanning"],
    ["🔢", "Full nutrition & macros"],
    ["📅", "Weekly meal planner"],
    ["🛒", "Auto grocery list"],
    ["❤️", "Unlimited saved recipes"],
    ["🌍", "Cuisine selector"],
    ["✨", "Unlimited AI recipe generation"],
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, overflowY: "auto",
      background: `linear-gradient(160deg, ${C.espresso} 0%, #1a0f07 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 24px 40px",
    }}>
      {/* Crown + title */}
      <div style={{ fontSize: 52, marginBottom: 12 }}>👑</div>
      <div style={{
        fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700,
        color: C.gold, textAlign: "center", marginBottom: 8,
      }}>Your free trial has ended</div>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, textAlign: "center", marginBottom: 28, maxWidth: 300 }}>
        Unlock everything to keep cooking smarter with your fridge
      </div>

      {/* Feature list */}
      <div style={{
        background: "rgba(255,255,255,0.06)", borderRadius: 18,
        padding: "18px 20px", width: "100%", maxWidth: 380, marginBottom: 24,
      }}>
        {features.map(([icon, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 18, width: 26, textAlign: "center" }}>{icon}</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", flex: 1 }}>{label}</span>
            <span style={{ color: C.gold, fontSize: 16 }}>✓</span>
          </div>
        ))}
      </div>

      {/* Billing toggle */}
      <div style={{
        display: "flex", background: "rgba(255,255,255,0.08)",
        borderRadius: 30, padding: 4, marginBottom: 16, width: "100%", maxWidth: 380,
      }}>
        {["monthly","yearly"].map(b => (
          <button key={b} onClick={() => setBilling(b)} style={{
            flex: 1, padding: "10px 0", border: "none", borderRadius: 26,
            background: billing === b ? C.terra : "transparent",
            color: billing === b ? "#fff" : "rgba(255,255,255,0.5)",
            fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
            position: "relative",
          }}>
            {b === "yearly" ? "Yearly" : "Monthly"}
            {b === "yearly" && (
              <span style={{
                position: "absolute", top: -8, right: 8,
                background: C.gold, color: C.espresso,
                fontSize: 9, fontWeight: 800, borderRadius: 10,
                padding: "2px 6px",
              }}>SAVE {savings}%</span>
            )}
          </button>
        ))}
      </div>

      {/* Price display */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ color: "#fff", fontSize: 40, fontWeight: 800 }}>
          {symbol}{billing === "yearly" ? perMonth : monthly}
          <span style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>/mo</span>
        </div>
        {billing === "yearly" && (
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
            Billed {symbol}{yearly}/year · cancel anytime
          </div>
        )}
      </div>

      {/* CTA */}
      <button onClick={() => onUpgrade(priceId)} style={{
        width: "100%", maxWidth: 380, padding: "18px 0",
        background: `linear-gradient(135deg, ${C.terra}, ${C.terraDeep})`,
        color: "#fff", border: "none", borderRadius: 16,
        fontSize: 17, fontWeight: 800, cursor: "pointer",
        boxShadow: "0 6px 24px rgba(196,98,45,0.45)",
        marginBottom: 12,
      }}>
        Unlock Premium →
      </button>

      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", lineHeight: 1.8 }}>
        🔒 Secure payment via Stripe · Cancel anytime
      </div>

      {/* Social proof */}
      <div style={{
        marginTop: 28, background: "rgba(255,255,255,0.05)",
        borderRadius: 14, padding: "14px 18px", maxWidth: 380, width: "100%",
      }}>
        <div style={{ color: C.gold, fontSize: 14, marginBottom: 4 }}>★★★★★</div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.5 }}>
          "FridgeChef saves me $200/month on groceries. I never waste food anymore."
        </div>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 6 }}>— Maria K., home cook</div>
      </div>
    </div>
  );
}

// ─── Onboarding ───────────────────────────────────────────────
const OB_STEPS = [
  {
    id:"goal", emoji:"🎯",
    headline:"What's your #1 goal\nwith FridgeChef?",
    sub:"We'll personalise every recipe to match.",
    multi: false,
    options:[
      { icon:"🥗", label:"Eat healthier" },
      { icon:"💰", label:"Save money on groceries" },
      { icon:"🗑️", label:"Stop wasting food" },
      { icon:"⏰", label:"Cook faster meals" },
      { icon:"🎓", label:"Level up my cooking" },
      { icon:"🍽️", label:"Just explore recipes" },
    ],
  },
  {
    id:"who", emoji:"👨‍👩‍👧",
    headline:"Who are you\ncooking for?",
    sub:"Portions and complexity adapt to your household.",
    multi: false,
    options:[
      { icon:"🧍", label:"Just me" },
      { icon:"👫", label:"Me & partner" },
      { icon:"👨‍👩‍👦", label:"Family with kids" },
      { icon:"🏠", label:"Roommates" },
      { icon:"🍱", label:"Meal prepping" },
    ],
  },
  {
    id:"skill", emoji:"👨‍🍳",
    headline:"How confident are\nyou in the kitchen?",
    sub:"We'll match recipe complexity to your level.",
    multi: false,
    options:[
      { icon:"🔰", label:"Beginner – I follow recipes closely" },
      { icon:"🍳", label:"Intermediate – I'm comfortable" },
      { icon:"⭐", label:"Advanced – I love to improvise" },
    ],
  },
  {
    id:"time", emoji:"⏱️",
    headline:"How much time do\nyou usually have?",
    sub:"We'll filter recipes to fit your schedule.",
    multi: false,
    options:[
      { icon:"⚡", label:"Under 15 minutes" },
      { icon:"🕐", label:"15–30 minutes" },
      { icon:"⏱️", label:"30–60 minutes" },
      { icon:"🍲", label:"I love slow cooking" },
    ],
  },
  {
    id:"diet", emoji:"🌿",
    headline:"Any dietary needs\nor preferences?",
    sub:"Pick all that apply — recipes will match.",
    multi: true,
    options:[
      { icon:"🍽️", label:"No restrictions" },
      { icon:"🥦", label:"Vegetarian" },
      { icon:"🌱", label:"Vegan" },
      { icon:"☪️", label:"Halal" },
      { icon:"💪", label:"Low-carb" },
      { icon:"🌾", label:"Gluten-free" },
    ],
  },
  {
    id:"struggle", emoji:"😤",
    headline:"What's your biggest\nkitchen struggle?",
    sub:"We'll focus on solving this for you first.",
    multi: false,
    options:[
      { icon:"💡", label:"No recipe inspiration" },
      { icon:"🗑️", label:"Ingredients go to waste" },
      { icon:"⏰", label:"Never enough time" },
      { icon:"🥗", label:"Eating healthy feels hard" },
      { icon:"💸", label:"Groceries cost too much" },
    ],
  },
];

function Onboarding({ onDone }) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishPct, setFinishPct] = useState(0);

  const s = OB_STEPS[step];
  const isLast = step === OB_STEPS.length - 1;

  function pick(label) {
    if (s.multi) {
      if (label === "No restrictions") { setSelected(["No restrictions"]); return; }
      setSelected(prev => {
        const without = prev.filter(x => x !== "No restrictions");
        return without.includes(label) ? without.filter(x => x !== label) : [...without, label];
      });
    } else {
      setSelected([label]);
    }
  }

  function next() {
    if (!selected.length) return;
    const newAnswers = { ...answers, [s.id]: s.multi ? selected : selected[0] };
    setAnswers(newAnswers);

    if (isLast) {
      // Save to localStorage and launch finishing animation
      localStorage.setItem("fc_onboarded", "1");
      localStorage.setItem("fc_prefs", JSON.stringify(newAnswers));
      setFinishing(true);
      let pct = 0;
      const iv = setInterval(() => {
        pct += 2;
        setFinishPct(pct);
        if (pct >= 100) { clearInterval(iv); setTimeout(() => onDone(newAnswers), 400); }
      }, 30);
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setSelected([]);
      setAnimating(false);
    }, 220);
  }

  const progress = (step / OB_STEPS.length) * 100;

  if (finishing) return (
    <div style={{
      position:"fixed", inset:0, background:C.espresso,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:32, zIndex:9999,
    }}>
      <div style={{ fontSize:56, marginBottom:24 }}>🍳</div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:"#fff", marginBottom:8, textAlign:"center" }}>
        Building your kitchen
      </div>
      <div style={{ color:"rgba(255,255,255,0.6)", fontSize:14, marginBottom:40 }}>
        Personalising recipes just for you…
      </div>
      <div style={{ width:240, height:6, background:"rgba(255,255,255,0.15)", borderRadius:99 }}>
        <div style={{ height:"100%", width:`${finishPct}%`, background:C.terra, borderRadius:99, transition:"width 0.03s linear" }} />
      </div>
      <div style={{ color:C.terra, fontSize:13, fontWeight:600, marginTop:14 }}>{finishPct}%</div>
      <div style={{ marginTop:40, color:"rgba(255,255,255,0.4)", fontSize:12, textAlign:"center", lineHeight:1.8 }}>
        {finishPct < 30 && "Analysing your goals…"}
        {finishPct >= 30 && finishPct < 60 && "Tuning recipe difficulty…"}
        {finishPct >= 60 && finishPct < 85 && "Applying dietary preferences…"}
        {finishPct >= 85 && "Almost ready…"}
      </div>
    </div>
  );

  return (
    <div style={{
      position:"fixed", inset:0, background:C.cream, zIndex:9999,
      display:"flex", flexDirection:"column", overflowY:"auto",
    }}>
      {/* Progress bar */}
      <div style={{ height:4, background:C.border, flexShrink:0 }}>
        <div style={{ height:"100%", width:`${progress}%`, background:C.terra, transition:"width 0.35s ease" }} />
      </div>

      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        padding:"32px 24px 24px", maxWidth:480, width:"100%", margin:"0 auto",
        opacity: animating ? 0 : 1, transform: animating ? "translateX(30px)" : "translateX(0)",
        transition:"opacity 0.2s, transform 0.2s",
      }}>
        {/* Step counter */}
        <div style={{ fontSize:12, fontWeight:700, color:C.muted, letterSpacing:"0.08em", marginBottom:20 }}>
          {step + 1} of {OB_STEPS.length}
        </div>

        {/* Emoji + headline */}
        <div style={{ fontSize:44, marginBottom:16 }}>{s.emoji}</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:C.espresso, lineHeight:1.25, marginBottom:8, whiteSpace:"pre-line" }}>
          {s.headline}
        </div>
        <div style={{ fontSize:14, color:C.muted, marginBottom:32, lineHeight:1.5 }}>{s.sub}</div>

        {/* Options */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, flex:1 }}>
          {s.options.map(o => {
            const active = selected.includes(o.label);
            return (
              <button key={o.label} onClick={() => pick(o.label)} style={{
                display:"flex", alignItems:"center", gap:14,
                background: active ? C.espresso : "#fff",
                border: `2px solid ${active ? C.espresso : C.border}`,
                borderRadius:16, padding:"16px 18px",
                cursor:"pointer", textAlign:"left",
                boxShadow: active ? "0 4px 18px rgba(44,26,14,0.18)" : "0 1px 4px rgba(0,0,0,0.05)",
                transition:"all 0.15s",
              }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{o.icon}</span>
                <span style={{ fontSize:15, fontWeight:600, color: active ? "#fff" : C.espresso, lineHeight:1.3 }}>{o.label}</span>
                {active && <span style={{ marginLeft:"auto", color:C.terra, fontSize:18, flexShrink:0 }}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button onClick={next} disabled={!selected.length} style={{
          marginTop:28, width:"100%", padding:"18px 0",
          background: selected.length ? C.terra : C.border,
          color: selected.length ? "#fff" : C.muted,
          border:"none", borderRadius:16, fontSize:16, fontWeight:700,
          cursor: selected.length ? "pointer" : "default",
          transition:"background 0.2s, color 0.2s",
          boxShadow: selected.length ? "0 4px 18px rgba(196,98,45,0.35)" : "none",
        }}>
          {isLast ? "Build my kitchen →" : "Continue →"}
        </button>

        {step === 0 && (
          <div style={{ textAlign:"center", color:C.muted, fontSize:12, marginTop:16 }}>
            Takes less than a minute · Free forever
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────
function FridgeChefApp() {
  const { user, signIn, logOut, authError, inAppBrowser } = useAuth();
  const [onboarded, setOnboarded] = useState(() => {
    if (typeof window === "undefined") return true; // skip on server
    return !!localStorage.getItem("fc_onboarded");
  });
  const [userPrefs, setUserPrefs] = useState(() => {
    try {
      if (typeof window === "undefined") return {};
      return JSON.parse(localStorage.getItem("fc_prefs") || "{}");
    } catch { return {}; }
  });

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
  const [cuisine, setCuisine]     = useState("any");
  const [recipeError, setRecipeError] = useState("");
  const [plannerError, setPlannerError] = useState("");

  // Premium & trial state
  const [isPremium, setIsPremium]     = useState(false);
  const [inTrial, setInTrial]         = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [trialExpired, setTrialExpired]   = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  // Feature gates
  const isUnlocked = isPremium || inTrial;
  // Nutrition: only day 1 of trial (trialDaysLeft===7 means first 24h) or paid premium
  const isNutritionUnlocked = isPremium || (inTrial && trialDaysLeft === 7);

  // Daily usage counter for voice & photo (3/day during trial)
  function getTodayKey(type) {
    return `fc_${type}_${new Date().toISOString().slice(0,10)}`;
  }
  function getDailyUsage(type) {
    return parseInt(localStorage.getItem(getTodayKey(type)) || "0");
  }
  function incrementDailyUsage(type) {
    const key = getTodayKey(type);
    localStorage.setItem(key, String(getDailyUsage(type) + 1));
  }
  const DAILY_TRIAL_LIMIT = 3;
  function canUseFeature(type) {
    if (isPremium) return true;           // premium = unlimited
    if (!inTrial) return false;            // trial expired
    return getDailyUsage(type) < DAILY_TRIAL_LIMIT;
  }
  function remainingUses(type) {
    if (isPremium) return "∞";
    return Math.max(0, DAILY_TRIAL_LIMIT - getDailyUsage(type));
  }
  const [listening, setListening]     = useState(false);
  const [handsFree, setHandsFree]     = useState(false);
  const [voiceIngredient, setVoiceIngredient] = useState("");
  const [currency, setCurrency]       = useState(CURRENCIES.DEFAULT);

  const inputRef   = useRef();
  const intervalRef = useRef();
  const recognitionRef = useRef(null);

  // Detect country for currency (cached in localStorage for 24 h)
  useEffect(() => {
    try {
      const cached = localStorage.getItem("fc_country");
      const cachedAt = localStorage.getItem("fc_country_at");
      if (cached && cachedAt && Date.now() - Number(cachedAt) < 86400000) {
        setCurrency(getCurrencyForCountry(cached)); return;
      }
    } catch {}
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(data => {
        if (data.country_code) {
          setCurrency(getCurrencyForCountry(data.country_code));
          try {
            localStorage.setItem("fc_country", data.country_code);
            localStorage.setItem("fc_country_at", String(Date.now()));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Load from Firestore + check premium/trial status
  useEffect(() => {
    if (!user) return;
    getFavorites(user.uid).then(setFavorites).catch(console.error);
    getMealPlan(user.uid).then(setPlanner).catch(console.error);
    getUserStatus(user.uid).then(s => {
      // Dev override: localStorage.setItem('fc_trial_test', '6') = simulate day 6
      const testDay = parseInt(localStorage.getItem("fc_trial_test") || "0");
      if (testDay > 0 && !s.isPremium) {
        const daysLeft = Math.max(0, 7 - testDay);
        setIsPremium(false);
        setInTrial(daysLeft > 0);
        setTrialDaysLeft(daysLeft);
        setTrialExpired(daysLeft === 0);
        return;
      }
      setIsPremium(s.isPremium);
      setInTrial(s.inTrial);
      setTrialDaysLeft(s.trialDaysLeft);
      setTrialExpired(s.trialExpired);
    }).catch(console.error);
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
    if (!canUseFeature("voice")) {
      if (!inTrial && !isPremium) { setShowPremium(true); return; }
      alert(`You've used all ${DAILY_TRIAL_LIMIT} free voice captures for today. Come back tomorrow or upgrade to Premium for unlimited.`);
      return;
    }
    incrementDailyUsage("voice");
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
  }, [isUnlocked]);

  // Stop voice recognition on unmount
  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  // ── Stripe checkout ───────────────────────────────────────────
  const handleUpgrade = async (priceId) => {
    if (!user) {
      signIn();
      setShowPremium(false);
      return;
    }
    if (!priceId) {
      alert("Stripe is not configured yet.");
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
    if (!canUseFeature("photo")) {
      if (!inTrial && !isPremium) { setShowPremium(true); return; }
      alert(`You've used all ${DAILY_TRIAL_LIMIT} free photo scans for today. Come back tomorrow or upgrade to Premium for unlimited.`);
      return;
    }
    incrementDailyUsage("photo");
    const fileInput = document.createElement("input");
    fileInput.type = "file"; fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setScanning(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result.split(",")[1];
          const mediaType = file.type || "image/jpeg";
          const res = await fetch("/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64, mediaType }),
          });
          const data = await res.json();
          if (!res.ok) { alert("Scan failed: " + (data.error || "unknown error")); return; }
          if (data.ingredients?.length) {
            const toAdd = data.ingredients.filter(
              s => !ingredients.map(x=>x.toLowerCase()).includes(s.toLowerCase())
            );
            if (toAdd.length) setIngredients(prev => [...prev, ...toAdd]);
          }
        } catch(err) {
          console.error("Scan error:", err);
          alert("Scan failed. Please try again.");
        } finally {
          setScanning(false);
        }
      };
      reader.readAsDataURL(file);
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
      const nutritionRequest = isNutritionUnlocked
        ? `Include "nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0} per serving for each recipe.`
        : "";
      const cuisineInstruction = cuisine !== "any"
        ? `Cuisine: ${cuisine} — ALL recipes MUST be authentic ${cuisine} dishes with real ${cuisine} dish names.`
        : "";
      const text = await callClaude(
        `I have: ${ingredients.join(", ")}. Diet: ${diet}. Max time: ${maxTime} min. ${cuisineInstruction}
Return a JSON array of exactly 3 recipes. Each item MUST follow this format exactly:
{"name":"","prepTime":"","difficulty":"Easy","ingredients":[],"steps":[],"missingIngredients":[],"substitutions":"${isNutritionUnlocked ? `","nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0}` : '"'}
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
    } finally {
      clearInterval(intervalRef.current); setLoading(false);
    }
  };

  // ── Favorites ─────────────────────────────────────────────────
  const toggleFavorite = async (recipe) => {
    const exists = favorites.find(r => r.name === recipe.name);
    const next = exists ? favorites.filter(r=>r.name!==recipe.name) : [...favorites, recipe];
    setFavorites(next);
    if (user) {
      try {
        exists ? await removeFavorite(user.uid, recipe) : await addFavorite(user.uid, recipe);
      } catch(err) {
        console.error("Favorite sync error:", err);
        setFavorites(favorites); // revert on error
      }
    }
  };
  const isFav = (r) => favorites.some(f => f.name === r.name);

  // ── Meal planner ──────────────────────────────────────────────
  const generateWeekPlan = async () => {
    if (!ingredients.length) return;
    setPlannerLoading(true); setPlannerError("");
    try {
      const cuisinePlan = cuisine !== "any" ? ` Cuisine: ${cuisine} dishes only.` : "";
      const text = await callClaude(
        `I have: ${ingredients.join(", ")}. Diet: ${diet}.${cuisinePlan}
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
    } catch(e) {
      console.error(e);
      alert("Couldn't generate grocery list. Please try again.");
    }
    setGroceryLoading(false);
  };

  const toggleCheck = (key) => setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Onboarding gate ──────────────────────────────────────────
  if (!onboarded) {
    return (
      <Onboarding onDone={(prefs) => {
        // Apply dietary preference from onboarding
        const dietMap = {
          "Vegetarian":"vegetarian", "Vegan":"vegan",
          "Halal":"halal", "Low-carb":"low-carb", "Gluten-free":"gluten-free",
        };
        const dietPref = prefs.diet && !prefs.diet.includes("No restrictions")
          ? dietMap[prefs.diet[0]] || "any"
          : "any";
        if (dietPref !== "any") setDiet(dietPref);

        // Apply time preference
        const timeMap = {
          "Under 15 minutes":"15", "15–30 minutes":"30",
          "30–60 minutes":"60", "I love slow cooking":"120",
        };
        if (prefs.time && timeMap[prefs.time]) setMaxTime(timeMap[prefs.time]);

        setUserPrefs(prefs);
        setOnboarded(true);
      }} />
    );
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:C.cream, paddingBottom:30 }}>

      {/* Trial reminder banner — show when ≤ 2 days left */}
      {inTrial && trialDaysLeft <= 2 && (
        <TrialBanner
          daysLeft={trialDaysLeft}
          onUpgrade={() => setShowPremium(true)}
        />
      )}

      {/* Soft banner when trial has expired */}
      {trialExpired && (
        <div style={{
          background: C.espresso, color:"#fff", padding:"10px 16px",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:10,
        }}>
          <span style={{ fontSize:13, fontWeight:600 }}>👑 Your free trial ended — upgrade to unlock premium features</span>
          <button onClick={() => setShowPremium(true)} style={{
            background: C.terra, color:"#fff", border:"none",
            borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0,
          }}>Upgrade</button>
        </div>
      )}

      {showPremium && (
        <PremiumModal
          onClose={() => setShowPremium(false)}
          initialCurrency={currency}
          onUpgrade={(priceId) => {
            setShowPremium(false);
            handleUpgrade(priceId);
          }}
        />
      )}

      <AppHeader
        user={user} signIn={signIn} logOut={logOut}
        isPremium={isNutritionUnlocked} onOpenPremium={() => setShowPremium(true)}
        currency={currency}
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

            {/* Cuisine filter chips */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Cuisine</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {CUISINE_OPTIONS.map(c => (
                  <button key={c.value} onClick={() => setCuisine(c.value)} style={{
                    border:`1.5px solid ${cuisine===c.value ? C.terra : C.border}`,
                    borderRadius:20, padding:"6px 12px", fontSize:12, fontWeight:600,
                    background: cuisine===c.value ? C.terraLight : C.cardBg,
                    color: cuisine===c.value ? C.terra : C.muted,
                    cursor:"pointer",
                  }}>{c.label}</button>
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
                  onClick={() => startVoice(false)}
                  title={canUseFeature("voice") ? "Voice input" : "Premium: voice input"}
                  style={{
                    background: listening ? C.terra : (canUseFeature("voice") ? C.terraLight : "#f0ece8"),
                    border:`1.5px solid ${listening ? C.terra : C.border}`,
                    borderRadius:12, width:44, cursor:"pointer", fontSize:18,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    position:"relative",
                  }}
                >
                  🎤
                  {!isPremium && !inTrial && <span style={{ position:"absolute", top:2, right:2, fontSize:8 }}>🔒</span>}
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
                  flex:1, background: canUseFeature("photo") ? C.cream : "#f0ece8",
                  border:`1.5px solid ${scanning ? C.terra : C.border}`, borderRadius:12, padding:"9px 0",
                  fontSize:13, fontWeight:600, cursor: scanning ? "wait" : "pointer",
                  color: canUseFeature("photo") ? C.espresso : C.muted,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2,
                }}>
                  <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                    {scanning ? "🔍 Scanning…" : "📷 Photo scan"}
                    {!isPremium && !inTrial && !scanning && <span style={{ fontSize:10 }}>🔒</span>}
                  </span>
                  {inTrial && !isPremium && !scanning && (
                    <span style={{ fontSize:10, color: remainingUses("photo") === 0 ? "#B71C1C" : C.muted, fontWeight:500 }}>
                      {remainingUses("photo")}/3 left today
                    </span>
                  )}
                </button>
                <button onClick={() => {
                  if (!canUseFeature("voice")) {
                    if (!inTrial && !isPremium) { setShowPremium(true); return; }
                    alert(`You've used all ${DAILY_TRIAL_LIMIT} free voice captures for today. Come back tomorrow or upgrade.`);
                    return;
                  }
                  incrementDailyUsage("voice");
                  setHandsFree(true); startVoice(true);
                }} style={{
                  flex:1, background: handsFree ? C.terraLight : (canUseFeature("voice") ? C.cream : "#f0ece8"),
                  border:`1.5px solid ${handsFree ? C.terra : C.border}`, borderRadius:12, padding:"9px 0",
                  fontSize:13, fontWeight:600, cursor:"pointer",
                  color: handsFree ? C.terra : (canUseFeature("voice") ? C.espresso : C.muted),
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2,
                }}>
                  <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                    🗣 Hands-free
                    {!isPremium && !inTrial && <span style={{ fontSize:10 }}>🔒</span>}
                  </span>
                  {inTrial && !isPremium && (
                    <span style={{ fontSize:10, color: remainingUses("voice") === 0 ? "#B71C1C" : C.muted, fontWeight:500 }}>
                      {remainingUses("voice")}/3 left today
                    </span>
                  )}
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
                isPremium={isNutritionUnlocked} onUpgrade={() => setShowPremium(true)}
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
            {!isUnlocked && (
              <div style={{
                background:C.espresso, borderRadius:20, padding:"24px 20px", marginTop:8,
                textAlign:"center",
              }}>
                <div style={{ color:C.gold, fontSize:18, marginBottom:6 }}>★★★★★</div>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginBottom:16 }}>
                  Loved by 500+ home cooks
                </div>
                <div style={{ fontSize:28, marginBottom:8 }}>👑</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:C.gold, fontWeight:700, marginBottom:6 }}>
                  Unlock Premium
                </div>
                <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, marginBottom:6, lineHeight:1.6 }}>
                  Voice input · Photo scan · Full macros &amp; nutrition
                </div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginBottom:16 }}>
                  &ldquo;Photo scan is magic. Meal plan in 10 seconds.&rdquo; — James K.
                </div>
                <button onClick={() => setShowPremium(true)} style={{
                  background:`linear-gradient(135deg,${C.terra},${C.terraDeep})`,
                  color:"#fff", border:"none", borderRadius:14, padding:"13px 28px",
                  fontSize:14, fontWeight:700, cursor:"pointer",
                  boxShadow:"0 4px 16px rgba(196,98,45,0.35)",
                }}>Start 7-day free trial</button>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, marginTop:10 }}>
                  From {currency.symbol}{currency.monthly}/mo · Cancel anytime
                </div>
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
                    isPremium={isNutritionUnlocked} onUpgrade={() => setShowPremium(true)}
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
