"use client";
// app/page.js
import { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "../components/AuthContext";
import { getFavorites, addFavorite, removeFavorite, getMealPlan, saveMealPlan } from "../lib/db";

// ─── Constants ────────────────────────────────────────────────

const TABS = ["recipes", "planner", "favorites", "grocery"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CUISINES = [
  { value: "any",      label: "🌍 Any cuisine" },
  { value: "filipino", label: "🇵🇭 Filipino" },
  { value: "indian",   label: "🇮🇳 Indian" },
  { value: "korean",   label: "🇰🇷 Korean" },
  { value: "chinese",  label: "🇨🇳 Chinese" },
  { value: "japanese", label: "🇯🇵 Japanese" },
  { value: "american", label: "🇺🇸 American" },
  { value: "italian",  label: "🇮🇹 Italian" },
  { value: "mexican",  label: "🇲🇽 Mexican" },
  { value: "thai",     label: "🇹🇭 Thai" },
];
const DAY_NAMES = { Mon:"Monday", Tue:"Tuesday", Wed:"Wednesday", Thu:"Thursday", Fri:"Friday", Sat:"Saturday", Sun:"Sunday" };
const MEALS = ["Breakfast", "Lunch", "Dinner"];
const EMOJI = { recipes:"🍳", planner:"📅", favorites:"❤️", grocery:"🛒" };
const MEAL_COLORS = { Breakfast:"#FFF3E0", Lunch:"#E8F5E9", Dinner:"#E3F2FD" };
const MEAL_TEXT   = { Breakfast:"#E65100", Lunch:"#2E7D32", Dinner:"#1565C0" };

// ─── API helper ───────────────────────────────────────────────

async function callClaude(prompt, system) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, system }),
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}

function parseJSON(text) {
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────

function IngredientTag({ label, onRemove }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      background:"#FFF3E0", color:"#E65100", border:"1px solid #FFCC80",
      borderRadius:20, padding:"4px 12px", fontSize:13, fontWeight:500,
    }}>
      {label}
      <button onClick={onRemove} style={{
        background:"none", border:"none", cursor:"pointer",
        color:"#E65100", fontSize:15, lineHeight:1, padding:0,
      }}>×</button>
    </span>
  );
}

function RecipeCard({ recipe, onSave, saved }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background:"#fff", borderRadius:16, border:"1px solid #f0e6d3",
      overflow:"hidden", marginBottom:14, boxShadow:"0 2px 12px rgba(230,81,0,0.06)",
    }}>
      <div onClick={() => setOpen(!open)} style={{
        padding:"14px 16px", cursor:"pointer", display:"flex",
        alignItems:"center", justifyContent:"space-between",
      }}>
        <div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:"#2D1B00" }}>
            {recipe.name}
          </div>
          <div style={{ fontSize:12, color:"#999", marginTop:3 }}>
            ⏱ {recipe.prepTime} · {recipe.difficulty || "Beginner"}
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onSave(recipe); }}
            style={{ background:saved?"#FFCDD2":"#FFF3E0", border:"none", borderRadius:20, padding:"5px 10px", cursor:"pointer", fontSize:16 }}
          >{saved ? "❤️" : "🤍"}</button>
          <span style={{ color:"#ccc", fontSize:18 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{ padding:"0 16px 16px", borderTop:"1px solid #f5efe6" }}>
          <Section label="Ingredients">
            <ul style={{ margin:0, paddingLeft:18 }}>
              {recipe.ingredients?.map((ing, i) => (
                <li key={i} style={{ fontSize:13, color:"#555", marginBottom:3 }}>{ing}</li>
              ))}
            </ul>
          </Section>
          <Section label="Steps">
            {recipe.steps?.map((step, i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
                <span style={{
                  minWidth:22, height:22, background:"#E65100", color:"#fff",
                  borderRadius:"50%", fontSize:11, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>{i+1}</span>
                <span style={{ fontSize:13, color:"#444", lineHeight:1.6 }}>{step}</span>
              </div>
            ))}
          </Section>
          {recipe.missingIngredients?.length > 0 && (
            <InfoBox color="#FFF8E1" labelColor="#F57F17" label="⚠️ Missing">
              {recipe.missingIngredients.join(", ")}
            </InfoBox>
          )}
          {recipe.substitutions && (
            <InfoBox color="#E8F5E9" labelColor="#2E7D32" label="💡 Substitutions">
              {recipe.substitutions}
            </InfoBox>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginTop:14 }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#E65100", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{label}</div>
      {children}
    </div>
  );
}

function InfoBox({ color, labelColor, label, children }) {
  return (
    <div style={{ marginTop:12, background:color, borderRadius:10, padding:"10px 14px" }}>
      <div style={{ fontSize:12, fontWeight:700, color:labelColor, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:13, color:"#555" }}>{children}</div>
    </div>
  );
}

function OrangeButton({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", border:"none", borderRadius:14, padding:"15px",
      fontSize:15, fontWeight:700, letterSpacing:"0.02em",
      background: disabled ? "#ccc" : "linear-gradient(135deg,#FF6F00,#E65100)",
      color:"#fff", cursor: disabled ? "not-allowed" : "pointer",
      marginBottom:16, transition:"opacity 0.2s",
    }}>{children}</button>
  );
}

// ─── Auth Banner ──────────────────────────────────────────────

function AuthBanner({ user, signIn, logOut, authError }) {
  if (user === undefined) return null; // loading
  if (!user) return (
    <div style={{
      background:"#fff7f0", borderTop:"1px solid #ffe0b2",
      padding:"10px 16px",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:13, color:"#777" }}>Sign in to save recipes &amp; plans</span>
        <button onClick={signIn} style={{
          background:"#E65100", color:"#fff", border:"none",
          borderRadius:10, padding:"7px 14px", fontSize:13, fontWeight:600, cursor:"pointer",
        }}>Sign in with Google</button>
      </div>
      {authError && (
        <div style={{ marginTop:6, fontSize:12, color:"#c62828" }}>{authError}</div>
      )}
    </div>
  );
  return (
    <div style={{
      background:"#fff7f0", borderTop:"1px solid #ffe0b2",
      padding:"8px 16px", display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      <span style={{ fontSize:12, color:"#999" }}>👋 {user.displayName || user.email}</span>
      <button onClick={logOut} style={{
        background:"none", border:"1px solid #ddd", borderRadius:8,
        padding:"4px 10px", fontSize:12, cursor:"pointer", color:"#999",
      }}>Sign out</button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────

function FridgeChefApp() {
  const { user, signIn, logOut, authError } = useAuth();
  const [tab, setTab]                     = useState("recipes");
  const [input, setInput]                 = useState("");
  const [ingredients, setIngredients]     = useState(["Chicken","Cabbage","Garlic"]);
  const [recipes, setRecipes]             = useState([]);
  const [loading, setLoading]             = useState(false);
  const [loadingMsg, setLoadingMsg]       = useState("");
  const [favorites, setFavorites]         = useState([]);
  const [planner, setPlanner]             = useState({});
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [groceryList, setGroceryList]     = useState({});
  const [groceryLoading, setGroceryLoading] = useState(false);
  const [checkedItems, setCheckedItems]   = useState({});
  const [diet, setDiet]                   = useState("any");
  const [maxTime, setMaxTime]             = useState("30");
  const [cuisine, setCuisine]             = useState("any");
  const [recipeError, setRecipeError]     = useState("");
  const [plannerError, setPlannerError]   = useState("");
  const inputRef = useRef();
  const intervalRef = useRef();

  // Load from Firestore when user logs in
  useEffect(() => {
    if (!user) return;
    getFavorites(user.uid).then(setFavorites).catch(console.error);
    getMealPlan(user.uid).then(setPlanner).catch(console.error);
  }, [user]);

  // ── Ingredients ──────────────────────────────────────────────
  const addIngredient = () => {
    const val = input.trim();
    if (val && !ingredients.map(s=>s.toLowerCase()).includes(val.toLowerCase())) {
      setIngredients([...ingredients, val]);
    }
    setInput("");
    inputRef.current?.focus();
  };
  const removeIngredient = (i) => setIngredients(ingredients.filter((_,idx) => idx !== i));

  // ── Recipe generation ─────────────────────────────────────────
  const generateRecipes = async () => {
    if (!ingredients.length) return;
    setLoading(true); setRecipes([]); setRecipeError("");
    const msgs = ["Checking your fridge…","Thinking up recipes…","Almost ready!"];
    let mi = 0; setLoadingMsg(msgs[0]);
    intervalRef.current = setInterval(() => { mi=(mi+1)%msgs.length; setLoadingMsg(msgs[mi]); }, 1500);
    try {
      const cuisineInstruction = cuisine !== "any"
        ? `Cuisine: ${cuisine} — recipes MUST be authentic ${cuisine} dishes (use real dish names from that cuisine).`
        : "Cuisine: any.";
      const text = await callClaude(
        `I have: ${ingredients.join(", ")}. Diet: ${diet}. Max time: ${maxTime} min. Skill: beginner. ${cuisineInstruction}
Return a JSON array of exactly 3 recipes. Each item:
{"name":"","prepTime":"","difficulty":"Easy","ingredients":[],"steps":[],"missingIngredients":[],"substitutions":""}
Budget-friendly. Use mostly the provided ingredients. Return ONLY the JSON array.`,
        "You are a home chef AI. Return ONLY valid JSON with no markdown or explanation."
      );
      const parsed = parseJSON(text);
      if (Array.isArray(parsed)) setRecipes(parsed);
      else if (parsed) setRecipes([parsed]);
      else setRecipeError("Couldn't parse recipes. Please try again.");
    } catch(e) {
      console.error(e);
      setRecipeError("Something went wrong. Check your API key or try again.");
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
      const cuisineInstruction = cuisine !== "any" ? ` Cuisine: ${cuisine} dishes only.` : "";
      const text = await callClaude(
        `I have: ${ingredients.join(", ")}. Diet: ${diet}.${cuisineInstruction}
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
        setPlannerError("Couldn't generate plan. Please try again.");
      }
    } catch(e) {
      console.error(e);
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
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:"#FDFAF6", paddingBottom:90 }}>

      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#FF6F00 0%,#E65100 100%)",
        padding:"32px 20px 20px", borderRadius:"0 0 28px 28px",
      }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:"#fff", fontWeight:700 }}>
          🍳 FridgeChef
        </div>
        <div style={{ color:"rgba(255,255,255,0.8)", fontSize:13, marginTop:4 }}>
          Cook smart with what you have
        </div>
      </div>

      {/* Auth banner */}
      <AuthBanner user={user} signIn={signIn} logOut={logOut} authError={authError} />

      {/* Tab bar */}
      <div style={{
        display:"flex", background:"#fff", margin:"12px 16px 0",
        borderRadius:16, padding:4, gap:2,
        boxShadow:"0 2px 16px rgba(0,0,0,0.08)",
        position:"sticky", top:8, zIndex:10,
      }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex:1, border:"none", cursor:"pointer", borderRadius:12,
            padding:"8px 0", fontSize:10, fontWeight:600,
            background: tab===t ? "#E65100" : "transparent",
            color: tab===t ? "#fff" : "#aaa",
            transition:"all 0.2s",
          }}>
            <div style={{ fontSize:18 }}>{EMOJI[t]}</div>
            <div style={{ textTransform:"capitalize", marginTop:2 }}>{t}</div>
          </button>
        ))}
      </div>

      <div style={{ padding:"16px 16px 0" }}>

        {/* ── RECIPES TAB ── */}
        {tab === "recipes" && (
          <div>
            {/* Filters */}
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              <select value={diet} onChange={e=>setDiet(e.target.value)} style={{
                flex:1, borderRadius:10, border:"1px solid #e8d5b7", padding:"8px 10px",
                fontSize:13, background:"#fff", color:"#333", outline:"none",
              }}>
                <option value="any">🍽 Any diet</option>
                <option value="vegetarian">🥦 Vegetarian</option>
                <option value="vegan">🌱 Vegan</option>
                <option value="halal">☪️ Halal</option>
                <option value="low-carb">💪 Low-carb</option>
                <option value="gluten-free">🌾 Gluten-free</option>
              </select>
              <select value={maxTime} onChange={e=>setMaxTime(e.target.value)} style={{
                flex:1, borderRadius:10, border:"1px solid #e8d5b7", padding:"8px 10px",
                fontSize:13, background:"#fff", color:"#333", outline:"none",
              }}>
                <option value="15">⚡ Under 15 min</option>
                <option value="30">🕐 Under 30 min</option>
                <option value="60">🕐 Under 1 hour</option>
                <option value="120">🍲 Any time</option>
              </select>
            </div>
            {/* Cuisine selector */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#E65100", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>
                Cuisine
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {CUISINES.map(c => (
                  <button key={c.value} onClick={() => setCuisine(c.value)} style={{
                    border: cuisine === c.value ? "2px solid #E65100" : "1px solid #e8d5b7",
                    borderRadius:20, padding:"5px 12px", fontSize:12, fontWeight:600,
                    background: cuisine === c.value ? "#FFF3E0" : "#fff",
                    color: cuisine === c.value ? "#E65100" : "#777",
                    cursor:"pointer", transition:"all 0.15s",
                  }}>{c.label}</button>
                ))}
              </div>
            </div>

            {/* Ingredient box */}
            <div style={{
              background:"#fff", borderRadius:16, border:"1px solid #f0e6d3", padding:14, marginBottom:14,
            }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#E65100", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>
                Your ingredients
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10, minHeight:30 }}>
                {ingredients.map((ing, i) => (
                  <IngredientTag key={i} label={ing} onRemove={() => removeIngredient(i)} />
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addIngredient()}
                  placeholder="Add an ingredient…"
                  style={{
                    flex:1, border:"1px solid #e8d5b7", borderRadius:10,
                    padding:"9px 12px", fontSize:14, background:"#FDFAF6", outline:"none",
                  }}
                />
                <button onClick={addIngredient} style={{
                  background:"#E65100", color:"#fff", border:"none",
                  borderRadius:10, padding:"9px 18px", fontSize:20, cursor:"pointer", fontWeight:700,
                }}>+</button>
              </div>
            </div>

            <OrangeButton onClick={generateRecipes} disabled={loading || !ingredients.length}>
              {loading ? loadingMsg : `✨ Generate Recipes (${ingredients.length} ingredients)`}
            </OrangeButton>

            {recipes.map((r,i) => (
              <RecipeCard key={i} recipe={r} onSave={toggleFavorite} saved={isFav(r)} />
            ))}

            {recipeError && (
              <div style={{ background:"#FFEBEE", borderRadius:10, padding:"12px 14px", marginBottom:12, fontSize:13, color:"#c62828" }}>
                {recipeError}
              </div>
            )}
            {!loading && !recipes.length && !recipeError && (
              <div style={{ textAlign:"center", padding:"40px 0", color:"#ccc" }}>
                <div style={{ fontSize:52 }}>🧅</div>
                <div style={{ fontSize:14, marginTop:8 }}>Add ingredients and tap Generate</div>
              </div>
            )}
          </div>
        )}

        {/* ── PLANNER TAB ── */}
        {tab === "planner" && (
          <div>
            <OrangeButton onClick={generateWeekPlan} disabled={plannerLoading || !ingredients.length}>
              {plannerLoading ? "Planning your week…" : "📅 Generate Week Plan"}
            </OrangeButton>
            {!user && (
              <div style={{ background:"#FFF8E1", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#795548" }}>
                💡 Sign in to save your meal plan across devices
              </div>
            )}
            {plannerError && (
              <div style={{ background:"#FFEBEE", borderRadius:10, padding:"12px 14px", marginBottom:12, fontSize:13, color:"#c62828" }}>
                {plannerError}
              </div>
            )}
            {Object.keys(planner).length > 0 ? (
              DAYS.map(day => (
                <div key={day} style={{
                  background:"#fff", borderRadius:14, border:"1px solid #f0e6d3", marginBottom:12, overflow:"hidden",
                }}>
                  <div style={{
                    background:"#E65100", color:"#fff", padding:"8px 14px",
                    fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700,
                  }}>{DAY_NAMES[day]}</div>
                  {MEALS.map(meal => (
                    <div key={meal} style={{
                      padding:"10px 14px", display:"flex", gap:10, alignItems:"center",
                      borderBottom: meal!=="Dinner" ? "1px solid #fdf4e8" : "none",
                    }}>
                      <span style={{
                        fontSize:11, fontWeight:700, color:MEAL_TEXT[meal],
                        background:MEAL_COLORS[meal], padding:"3px 8px",
                        borderRadius:20, minWidth:60, textAlign:"center",
                      }}>{meal}</span>
                      <span style={{ fontSize:13, color:"#444" }}>{planner[day]?.[meal] || "—"}</span>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div style={{ textAlign:"center", padding:"40px 0", color:"#ccc" }}>
                <div style={{ fontSize:52 }}>📅</div>
                <div style={{ fontSize:14, marginTop:8 }}>Add ingredients then generate a plan</div>
              </div>
            )}
          </div>
        )}

        {/* ── FAVORITES TAB ── */}
        {tab === "favorites" && (
          <div>
            {favorites.length > 0 ? (
              <>
                <div style={{ fontSize:13, color:"#999", marginBottom:12 }}>
                  {favorites.length} saved recipe{favorites.length!==1?"s":""}
                  {!user && " · Sign in to sync"}
                </div>
                {favorites.map((r,i) => (
                  <RecipeCard key={i} recipe={r} onSave={toggleFavorite} saved={true} />
                ))}
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"40px 0", color:"#ccc" }}>
                <div style={{ fontSize:52 }}>❤️</div>
                <div style={{ fontSize:14, marginTop:8 }}>Tap 🤍 on a recipe to save it here</div>
              </div>
            )}
          </div>
        )}

        {/* ── GROCERY TAB ── */}
        {tab === "grocery" && (
          <div>
            <OrangeButton onClick={generateGroceryList} disabled={groceryLoading}>
              {groceryLoading ? "Building your list…" : "🛒 Generate Grocery List"}
            </OrangeButton>
            {Object.keys(groceryList).length > 0 && (
              <div style={{ marginBottom:12 }}>
                <button onClick={() => setCheckedItems({})} style={{
                  background:"none", border:"1px solid #ddd", borderRadius:8,
                  padding:"5px 12px", fontSize:12, cursor:"pointer", color:"#999",
                }}>Clear all checks</button>
              </div>
            )}
            {Object.keys(groceryList).length > 0 ? (
              Object.entries(groceryList).map(([cat, items]) =>
                Array.isArray(items) && items.length > 0 && (
                  <div key={cat} style={{
                    background:"#fff", borderRadius:14, border:"1px solid #f0e6d3", marginBottom:12, overflow:"hidden",
                  }}>
                    <div style={{
                      padding:"10px 14px", background:"#FFF8F0",
                      fontWeight:700, fontSize:13, color:"#E65100",
                      borderBottom:"1px solid #f0e6d3",
                    }}>{cat}</div>
                    {items.map((item, i) => {
                      const key = `${cat}-${i}`;
                      const done = checkedItems[key];
                      return (
                        <div key={i} onClick={() => toggleCheck(key)} style={{
                          padding:"11px 14px", display:"flex", alignItems:"center", gap:12,
                          borderBottom: i<items.length-1 ? "1px solid #faf5ee" : "none",
                          cursor:"pointer",
                        }}>
                          <div style={{
                            width:20, height:20, borderRadius:6, flexShrink:0,
                            border: done ? "none" : "2px solid #ddd",
                            background: done ? "#E65100" : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center",
                          }}>
                            {done && <span style={{ color:"#fff", fontSize:12 }}>✓</span>}
                          </div>
                          <span style={{
                            fontSize:14, color: done ? "#bbb" : "#333",
                            textDecoration: done ? "line-through" : "none",
                          }}>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                )
              )
            ) : (
              <div style={{ textAlign:"center", padding:"40px 0", color:"#ccc" }}>
                <div style={{ fontSize:52 }}>🛒</div>
                <div style={{ fontSize:14, marginTop:8 }}>
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

// ─── Root export (wraps with AuthProvider) ────────────────────

export default function Page() {
  return (
    <AuthProvider>
      <FridgeChefApp />
    </AuthProvider>
  );
}
