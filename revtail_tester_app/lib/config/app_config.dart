import 'package:flutter/material.dart';

class AppConfig {
  static const String appName = 'Revtail Tester';
  static const String initialUrl = 'https://revtail.in/tester';
  static const String fallbackUrl = 'https://revtail.in/login';
  static const String domain = 'revtail.in';

  // Revtail Brand Colors
  static const Color primaryColor = Color(0xFF002E7E); // Navy Blue
  static const Color primaryDark = Color(0xFF061A40);
  static const Color accentColor = Color(0xFF10B981);  // Green
  static const Color amberColor = Color(0xFFF59E0B);
  static const Color backgroundColor = Color(0xFFF8FAFC);
  static const Color cardColor = Colors.white;
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);

  // User-Agent addition
  static const String userAgent =
      'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 RevtailTesterApp/1.0.0';
}

