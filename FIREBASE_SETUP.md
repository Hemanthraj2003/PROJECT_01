# 🔥 Firebase Setup Guide

## 📋 Required Files

You need to add your Firebase service account certificate to both locations:

```
├── SERVER/carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json
└── admin_pannel/carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json
```

## 🔑 How to Get Firebase Service Account Key

1. **Go to Firebase Console:** https://console.firebase.google.com/
2. **Select your project:** `carshu-1e768`
3. **Go to Project Settings** (gear icon)
4. **Navigate to "Service accounts" tab**
5. **Click "Generate new private key"**
6. **Download the JSON file**
7. **Rename it to:** `carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json`

## 📁 File Placement

**Copy the downloaded file to both locations:**

```bash
# Copy to SERVER directory
cp path/to/downloaded/file.json SERVER/carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json

# Copy to admin_pannel directory  
cp path/to/downloaded/file.json admin_pannel/carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json
```

## ✅ Verification

Run the setup check to verify files are in place:

```bash
npm run check
```

You should see:
- ✅ SERVER Firebase Certificate found
- ✅ Admin Panel Firebase Certificate found

## 🔒 Security Notes

- ✅ These files are automatically excluded from git
- ✅ Never commit these files to version control
- ✅ Keep these files secure and private
- ✅ Each developer needs their own copy

## 🚨 Important

**The application will not work without these certificate files!**

Both the SERVER and admin_pannel need access to Firebase, so both need the certificate file.
