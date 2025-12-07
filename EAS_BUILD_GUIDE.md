# Habit Tracker — EAS Build Guide

Complete step-by-step instructions to build a signed Android APK using EAS (Expo Application Services).

## Prerequisites

1. **Node.js & npm** installed
2. **Expo Account** — create at https://expo.dev (free)
3. **eas-cli** installed globally:
   ```bash
   npm install -g eas-cli
   ```

## Step 1: Set Up EAS

### 1.1 Create Expo Account
Visit https://expo.dev and create a free account.

### 1.2 Install eas-cli
```bash
npm install -g eas-cli
```

### 1.3 Login to Expo
```bash
eas login
```
Enter your Expo username and password. You'll be authenticated for the rest of the process.

## Step 2: Configure EAS for Android APK

### 2.1 Initialize EAS (if first time)
From the `/mobile` directory:
```bash
cd mobile
eas build:configure
```

This will:
- Create credential files
- Ask permission to let EAS manage your keystore (choose "Yes" for simplicity)
- Connect to your Expo account

### 2.2 Verify Configuration Files Exist

After initialization, check:
- `app.json` ✓ (already configured in this project)
- `eas.json` ✓ (already created)

Both are ready. No additional changes needed.

## Step 3: Build the APK

### 3.1 Run the Build Command
From `/mobile` directory:
```bash
eas build --platform android --profile production
```

### 3.2 What Happens
- EAS will upload your code to their servers
- Build process runs (takes 5–15 minutes depending on queue)
- You'll get a build URL in the terminal and via email
- APK is ready for download after build completes

### 3.3 Monitor Build Status
Check live status:
```bash
eas build --platform android --status
```

Or view in Expo Dashboard: https://expo.dev/projects

## Step 4: Download & Install APK

### 4.1 Download
After build completes, you'll see a URL like:
```
✅ Build finished: https://expo.dev/artifacts/xxxxxxx.apk
```

Click the link or use:
```bash
eas build --platform android --latest
```

### 4.2 Install on Device or Emulator

**Option A: Android Device (USB Connected)**
```bash
adb install path/to/habit-tracker.apk
```

**Option B: Android Emulator**
```bash
adb install path/to/habit-tracker.apk
```

**Option C: Manual Install**
- Download APK to your device
- Tap to install
- Allow installation from unknown sources if prompted

## Step 5: Test the App

1. Open Habit Tracker on your Android device
2. Add habits, toggle checkboxes, edit names
3. Verify all features work smoothly
4. Check animations and UI rendering

## Troubleshooting

### Build Fails: "SDK Version Mismatch"
Update your dependencies:
```bash
cd mobile
npm update expo react-native
expo doctor
```

### Build Fails: "Credentials Invalid"
Reset credentials:
```bash
eas build:configure --platform android --clear
```

Then run `eas build --platform android --profile production` again.

### APK Won't Install: "Parse Error"
The APK may be corrupt. Re-download and try again, or rebuild.

### Firebase Config Missing
If you see Firebase errors at runtime:
- The app works without Firebase (no sign-in required)
- Habits are stored locally in browser/device memory
- To add Firestore later, update `mobile/firebase.js` with your project credentials

## Advanced Options

### Build AAB for Play Store (Instead of APK)
Edit `mobile/eas.json`:
```json
"android": {
  "buildType": "aab"
}
```

Then run:
```bash
eas build --platform android --profile production
```

### Customize Versioning
Edit `mobile/app.json`:
```json
"version": "1.0.1",
"android": {
  "versionCode": 2
}
```

Then rebuild.

### Sign with Custom Keystore (Advanced)
Instead of letting EAS manage credentials, you can provide your own keystore. See: https://docs.expo.dev/build/gradle-credentials/

## What's Inside the APK?

- React Native app with Firebase integration ready (no auth required)
- Habit tracker with 30-day grid, weekly planner, yearly stats
- Local storage for all habits
- Animations via Framer Motion equivalent (React Native Animated)
- Tailwind-like responsive design

## Next: Submit to Play Store

To release on Google Play Store:
1. Create a Google Play Developer account ($25 one-time)
2. Build with AAB format (not APK)
3. Use `eas submit` for automated submission
4. Follow Play Store review guidelines

For detailed guide: https://docs.expo.dev/distribution/app-stores/

## Quick Reference

```bash
# Set up
npm install -g eas-cli
eas login

# Navigate to mobile
cd mobile

# First time setup
eas build:configure

# Build APK
eas build --platform android --profile production

# Check status
eas build --platform android --status

# Install on device
adb install path/to/apk

# View dashboard
# Open: https://expo.dev/projects
```

## Support

- **EAS Docs**: https://docs.expo.dev/build/introduction/
- **Expo Forums**: https://forums.expo.dev/
- **Common Issues**: https://docs.expo.dev/build/troubleshooting/

Happy building! 🚀
