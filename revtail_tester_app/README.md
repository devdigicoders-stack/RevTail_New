# Revtail Tester Mobile App 🚀

Flutter WebView-based Android and iOS mobile app for **Revtail Tester Portal** (`https://revtail.in/tester`).

---

## 📱 Features Included

1. **Persistent Authentication & Session**:
   - Stores session cookies and local storage permanently so testers stay logged in across app launches.
2. **Photo & Screenshot Upload Support**:
   - Configured with Android and iOS camera and gallery permissions to seamlessly handle task proof submissions, receipt uploads, and profile image uploads via native file pickers.
3. **Pull-to-Refresh**:
   - Pull down anywhere to refresh campaigns, wallet balance, and task statuses.
4. **Smart External Link Interception**:
   - **WhatsApp Links**: Opens the WhatsApp app directly (for Community groups / help).
   - **Phone & Email Links**: Opens the native phone dialer (`tel:`) and email client (`mailto:`).
   - **External Product Links**: Opens external e-commerce sites (e.g., Amazon, Flipkart) in the phone's browser so testers never lose their in-app Revtail session.
5. **Native Navigation & Back Button Handling**:
   - Android back button navigates WebView history (`goBack`).
   - Double-tap back within 2 seconds at the root screen to exit the app (prevents accidental closures).
6. **Network Connectivity & Offline Screen**:
   - Automatically detects internet loss using `connectivity_plus`.
   - Displays a branded offline screen with a one-tap "Try Again" retry action.
   - Automatically recovers and reloads once the network is restored.
7. **Sleek Brand UI & Progress Indicator**:
   - Matches Revtail's brand colors (`#002E7E` Navy Blue, `#10B981` Emerald Accent).
   - Shows a smooth progress bar while web pages are loading.

---

## 🛠️ How to Run and Build

### 1. Requirements
- Flutter SDK (>= 3.10.7)
- Android Studio / Android SDK (for Android build)
- Xcode (for iOS build on macOS)

### 2. Run in Debug Mode
Connect your phone via USB (or start an emulator) and run:
```bash
cd revtail_tester_app
flutter run
```

### 3. Build Release APK for Android (For testing or distribution)
```bash
cd revtail_tester_app
flutter build apk --release
```
The output APK file will be generated at:
`build/app/outputs/flutter-apk/app-release.apk`

You can directly transfer this `.apk` to any Android device and install it!

### 4. Build App Bundle for Google Play Store (.aab)
```bash
cd revtail_tester_app
flutter build appbundle --release
```

### 5. Build for iOS (macOS only)
```bash
cd revtail_tester_app
flutter build ios --release
```
Or open the `ios/` folder in Xcode and archive/run on your iPhone.
