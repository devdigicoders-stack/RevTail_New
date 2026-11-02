import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'config/app_config.dart';
import 'screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const RevtailTesterApp());
}

class RevtailTesterApp extends StatelessWidget {
  const RevtailTesterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppConfig.backgroundColor,
        primaryColor: AppConfig.primaryColor,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppConfig.primaryColor,
          primary: AppConfig.primaryColor,
          secondary: AppConfig.accentColor,
          surface: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: AppConfig.textPrimary,
          elevation: 0,
          scrolledUnderElevation: 0,
        ),
      ),
      home: const SplashScreen(),
    );
  }
}
