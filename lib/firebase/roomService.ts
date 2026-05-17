import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  runTransaction,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { haversineDistance } from "@/utils/haversine";
import type { Room } from "@/types";

const ROOMS_COLLECTION = "rooms";
const ROOM_RADIUS_M = 1000; // 1 km
const ROOM_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const MAX_USERS = 50;

export async function findNearbyRoom(
  lat: number,
  lng: number,
): Promise<Room | null> {
  const now = Timestamp.now();

  const q = query(
    collection(db, ROOMS_COLLECTION),
    where("active", "==", true),
    where("expiresAt", ">", now),
  );

  const snapshot = await getDocs(q);
  const candidates: Room[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.userCount >= MAX_USERS) return;

    const dist = haversineDistance(lat, lng, data.centerLat, data.centerLng);
    if (dist <= ROOM_RADIUS_M) {
      candidates.push({
        roomId: docSnap.id,
        centerLat: data.centerLat,
        centerLng: data.centerLng,
        createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        expiresAt:
          data.expiresAt?.toMillis?.() ?? Date.now() + ROOM_DURATION_MS,
        userCount: data.userCount,
        active: data.active,
      });
    }
  });

  if (candidates.length === 0) return null;

  // Return closest room
  candidates.sort((a, b) => {
    const distA = haversineDistance(lat, lng, a.centerLat, a.centerLng);
    const distB = haversineDistance(lat, lng, b.centerLat, b.centerLng);
    return distA - distB;
  });

  return candidates[0];
}

export async function createRoom(lat: number, lng: number): Promise<Room> {
  const now = Date.now();
  const expiresAt = now + ROOM_DURATION_MS;

  const roomData = {
    centerLat: lat,
    centerLng: lng,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromMillis(expiresAt),
    userCount: 1,
    active: true,
  };

  const docRef = await addDoc(collection(db, ROOMS_COLLECTION), roomData);

  return {
    roomId: docRef.id,
    centerLat: lat,
    centerLng: lng,
    createdAt: now,
    expiresAt,
    userCount: 1,
    active: true,
  };
}

export async function joinRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(roomRef);
    if (!snap.exists()) throw new Error("Room not found");
    const count = snap.data().userCount ?? 0;
    tx.update(roomRef, { userCount: Math.min(count + 1, MAX_USERS) });
  });
}

export async function leaveRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(roomRef);
    if (!snap.exists()) return;
    const count = snap.data().userCount ?? 1;
    tx.update(roomRef, { userCount: Math.max(count - 1, 0) });
  });
}

export async function markRoomInactive(roomId: string): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  await updateDoc(roomRef, { active: false });
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  const { getDoc } = await import("firebase/firestore");
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    roomId: snap.id,
    centerLat: data.centerLat,
    centerLng: data.centerLng,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    expiresAt: data.expiresAt?.toMillis?.() ?? Date.now(),
    userCount: data.userCount,
    active: data.active,
  };
}
