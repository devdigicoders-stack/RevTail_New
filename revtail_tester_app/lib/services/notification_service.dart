import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
    debugPrint("Handling background notification: ${message.messageId}");
  } catch (e) {
    debugPrint("Background handler error: $e");
  }
}

class NotificationService {
  static FirebaseMessaging? _firebaseMessaging;
  static String? currentToken;

  static Future<void> initialize() async {
    try {
      _firebaseMessaging = FirebaseMessaging.instance;

      // 1. Set background handler
      try {
        FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      } catch (e) {
        debugPrint("Error registering background handler: $e");
      }

      // 2. Set foreground presentation options
      try {
        await _firebaseMessaging!.setForegroundNotificationPresentationOptions(
          alert: true,
          badge: true,
          sound: true,
        );
      } catch (e) {
        debugPrint("Error setting foreground presentation: $e");
      }

      // 3. Request Notification Permission with timeout
      try {
        NotificationSettings settings = await _firebaseMessaging!
            .requestPermission(
              alert: true,
              badge: true,
              sound: true,
              provisional: false,
            )
            .timeout(const Duration(seconds: 4));

        debugPrint('Notification authorization status: ${settings.authorizationStatus}');
      } catch (e) {
        debugPrint("Error requesting notification permission: $e");
      }

      // 4. Foreground Message Listener
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint("Foreground notification received: ${message.notification?.title}");
      });

      // 5. Get and Sync Token with Backend (with strict timeout)
      try {
        String? token = await _firebaseMessaging!
            .getToken()
            .timeout(const Duration(seconds: 5));
        if (token != null && token.isNotEmpty) {
          currentToken = token;
          debugPrint("FCM Registration Token: $token");
          // Sync asynchronously without awaiting
          syncTokenWithBackend(token);
        }
      } catch (e) {
        debugPrint("Error fetching FCM token: $e");
      }

      // 6. Listen for Token Refreshes
      _firebaseMessaging!.onTokenRefresh.listen((newToken) {
        currentToken = newToken;
        syncTokenWithBackend(newToken);
      });
    } catch (e) {
      debugPrint("Error in NotificationService initialize: $e");
    }
  }

  /// Send FCM token to backend API (failsafe with timeout)
  static Future<void> syncTokenWithBackend(String token) async {
    try {
      final uri = Uri.parse('${AppConfig.initialUrl.replaceAll('/tester', '')}/api/tester/fcm-token');
      await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'token': token, 'platform': 'android'}),
      ).timeout(const Duration(seconds: 6));
    } catch (e) {
      debugPrint("Failed to sync FCM token with backend: $e");
    }
  }
}
