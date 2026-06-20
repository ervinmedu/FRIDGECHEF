import { db } from "./firebase";
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const TRIAL_DAYS = 7;

export async function getFavorites(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().favorites ?? [] : [];
}

export async function addFavorite(uid, recipe) {
  await setDoc(doc(db, "users", uid), { favorites: arrayUnion(recipe) }, { merge: true });
}

export async function removeFavorite(uid, recipe) {
  await setDoc(doc(db, "users", uid), { favorites: arrayRemove(recipe) }, { merge: true });
}

export async function getMealPlan(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().mealPlan ?? {} : {};
}

export async function saveMealPlan(uid, plan) {
  await setDoc(doc(db, "users", uid), { mealPlan: plan }, { merge: true });
}

// Returns { isPremium, inTrial, trialDaysLeft, trialExpired }
export async function getUserStatus(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const now = new Date();

  let data = snap.exists() ? snap.data() : {};

  // First-time user — start their trial
  if (!data.trialStartDate) {
    data = { ...data, trialStartDate: now.toISOString() };
    await setDoc(ref, { trialStartDate: now.toISOString() }, { merge: true });
  }

  const trialEnd = new Date(new Date(data.trialStartDate).getTime() + TRIAL_DAYS * 86400000);
  const msLeft   = trialEnd - now;
  const daysLeft = Math.ceil(msLeft / 86400000);
  const inTrial  = msLeft > 0;

  // Check paid premium
  let isPremium = false;
  if (data.isPremium) {
    isPremium = !data.premiumExpiry || new Date(data.premiumExpiry) > now;
  }

  return {
    isPremium,
    inTrial: inTrial && !isPremium,
    trialDaysLeft: Math.max(0, daysLeft),
    trialExpired: !inTrial && !isPremium,
  };
}

// Keep old export for /success page compat
export async function getPremiumStatus(uid) {
  const { isPremium } = await getUserStatus(uid);
  return isPremium;
}
