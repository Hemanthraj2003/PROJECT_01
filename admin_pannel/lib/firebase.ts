import * as admin from "firebase-admin";

// Singleton pattern to ensure Firebase is only initialized once
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized || admin.apps.length > 0) {
    return;
  }

  try {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(
        /\\n/g,
        "\n"
      ),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri:
        process.env.FIREBASE_AUTH_URI ||
        "https://accounts.google.com/o/oauth2/auth",
      token_uri:
        process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_CERT_URL ||
        "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    firebaseInitialized = true;
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    console.error("Make sure all required environment variables are set");
    throw error;
  }
};

// Initialize Firebase immediately
initializeFirebase();

// Firestore database instance
const db = admin.firestore();

export { db, admin };
