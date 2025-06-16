import * as admin from "firebase-admin";
import path from "path";

// Initialize Firebase Admin SDK only if it hasn't been initialized already
if (!admin.apps.length) {
  try {
    // Use the Firebase service account key file directly

    const serviceAccount = require("../carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log(
      "Firebase Admin initialized successfully with service account file"
    );
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    console.error(
      "Make sure the Firebase service account file exists in the admin_pannel directory"
    );
    throw new Error(
      "Failed to initialize Firebase Admin SDK - service account file not found"
    );
  }
}

// Firestore database instance
const db = admin.firestore();

export { db, admin };
