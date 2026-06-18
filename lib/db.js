// lib/db.js
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function getFavorites(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().favorites ?? [] : [];
}

export async function addFavorite(uid, recipe) {
  const snap = await getDoc(doc(db, "users", uid));
  const existing = snap.exists() ? snap.data().favorites ?? [] : [];
  if (existing.find((r) => r.name === recipe.name)) return;
  await setDoc(
    doc(db, "users", uid),
    { favorites: [...existing, recipe] },
    { merge: true }
  );
}

export async function removeFavorite(uid, recipe) {
  const snap = await getDoc(doc(db, "users", uid));
  const existing = snap.exists() ? snap.data().favorites ?? [] : [];
  await setDoc(
    doc(db, "users", uid),
    { favorites: existing.filter((r) => r.name !== recipe.name) },
    { merge: true }
  );
}

export async function getMealPlan(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().mealPlan ?? {} : {};
}

export async function saveMealPlan(uid, plan) {
  await setDoc(doc(db, "users", uid), { mealPlan: plan }, { merge: true });
}

export async function getPremiumStatus(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return false;
  const data = snap.data();
  if (!data.isPremium) return false;
  // Check expiry
  if (data.premiumExpiry && new Date(data.premiumExpiry) < new Date()) return false;
  return true;
}
