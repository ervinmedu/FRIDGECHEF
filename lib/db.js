// lib/db.js
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Favorites ────────────────────────────────────────────────

export async function getFavorites(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().favorites ?? [] : [];
}

export async function addFavorite(uid, recipe) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { favorites: [recipe] });
  } else {
    // Firestore arrayUnion compares by value — store name as id check
    const existing = snap.data().favorites ?? [];
    if (!existing.find((r) => r.name === recipe.name)) {
      await updateDoc(ref, { favorites: arrayUnion(recipe) });
    }
  }
}

export async function removeFavorite(uid, recipe) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const updated = (snap.data().favorites ?? []).filter((r) => r.name !== recipe.name);
  await updateDoc(ref, { favorites: updated });
}

// ─── Meal Plan ────────────────────────────────────────────────

export async function getMealPlan(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().mealPlan ?? {} : {};
}

export async function saveMealPlan(uid, plan) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { mealPlan: plan });
  } else {
    await updateDoc(ref, { mealPlan: plan });
  }
}
