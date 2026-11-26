import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";

function formatPrivateKey(key: string | undefined): string {
  if (!key) return "";
  return key.replace(/\\n/g, "\n");
}

let firebaseApp: App | undefined;
let messaging: Messaging | undefined;

const apps = getApps();
if (!apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (projectId && clientEmail && privateKey) {
    try {
      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("✅ Firebase Admin Initialized Successfully (v13+ Modular)");
    } catch (error) {
      console.error("❌ Firebase Admin Initialization Error:", error);
    }
  } else {
    console.warn("⚠️ Firebase Admin credentials not fully configured in environment variables.");
  }
} else {
  firebaseApp = apps[0];
}

if (firebaseApp) {
  messaging = getMessaging(firebaseApp);
}

export { firebaseApp, messaging };
