const admin = require("firebase-admin");

// getting firebase credentials ...
const key = require("../carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json");

// Initialize Firebase only if it hasn't been initialized already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(key),
  });
}

//firestore databse instance ...
const db = admin.firestore();

module.exports = { db, admin };
