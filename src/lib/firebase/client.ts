"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { firebasePublicEnv, useEmulators } from "@/src/lib/firebase/env";

const app = getApps().length > 0 ? getApp() : initializeApp(firebasePublicEnv);

export const clientAuth = getAuth(app);
export const clientStorage = getStorage(app);

let emulatorsConnected = false;

if (useEmulators && typeof window !== "undefined" && !emulatorsConnected) {
  connectAuthEmulator(clientAuth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
  connectStorageEmulator(clientStorage, "127.0.0.1", 9199);
  emulatorsConnected = true;
}

export { app as clientFirebaseApp };
