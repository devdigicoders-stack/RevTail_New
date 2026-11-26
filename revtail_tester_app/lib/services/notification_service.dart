import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print("Handling background notification: ${message.messageId}");
}

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static String? currentToken;

  static Future<void> initialize() async {
    // 1. Request Notification Permission
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('User granted notification permission');
    }

    // 2. Set foreground presentation options (so FCM automatically shows banner even when app is open)
    await _firebaseMessaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    // 3. Register Background Handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // 4. Foreground Message Listener
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print("Foreground notification received: ${message.notification?.title}");
    });

    // 5. Get and Sync Token with Backend
    String? token = await _firebaseMessaging.getToken();
    if (token != null) {
      currentToken = token;
      print("FCM Registration Token: $token");
      await syncTokenWithBackend(token);
    }

    // Listen for Token Refreshes
    _firebaseMessaging.onTokenRefresh.listen((newToken) {
      currentToken = newToken;
      syncTokenWithBackend(newToken);
    });
  }

  /// Send FCM token to backend API
  static Future<void> syncTokenWithBackend(String token) async {
    try {
      final uri = Uri.parse('${AppConfig.initialUrl.replaceAll('/tester', '')}/api/tester/fcm-token');
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'token': token, 'platform': 'android'}),
      );
      print("Token sync response status: ${response.statusCode}");
    } catch (e) {
      print("Failed to sync FCM token with backend: $e");
    }
  }
}
