import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { serverEnv } from "@/src/lib/firebase/env";

let firebaseAdminApp: App;

if (getApps().length > 0) {
  firebaseAdminApp = getApps()[0]!;
} else {
  const hasServiceAccount =
    !!process.env.FIREBASE_CLIENT_EMAIL &&
    !!process.env.FIREBASE_PRIVATE_KEY;

  if (hasServiceAccount) {
    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId: serverEnv.projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      storageBucket: serverEnv.storageBucket,
    });
  } else {
    firebaseAdminApp = initializeApp({
      projectId: serverEnv.projectId,
      storageBucket: serverEnv.storageBucket,
    });
  }
}

export const adminApp = firebaseAdminApp;
export const adminAuth = getAuth(firebaseAdminApp);
export const adminDb = getFirestore(firebaseAdminApp);
export const adminStorage = getStorage(firebaseAdminApp);

try {
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch {
  // Firestore settings can only be applied once.
}
