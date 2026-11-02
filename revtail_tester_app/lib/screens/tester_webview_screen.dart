import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';
import '../config/app_config.dart';
import 'no_internet_screen.dart';

class TesterWebViewScreen extends StatefulWidget {
  const TesterWebViewScreen({super.key});

  @override
  State<TesterWebViewScreen> createState() => _TesterWebViewScreenState();
}

class _TesterWebViewScreenState extends State<TesterWebViewScreen> {
  late final WebViewController _controller;
  double _progress = 0;
  bool _isLoading = true;
  bool _hasError = false;
  String? _errorMessage;
  DateTime? _lastBackPressTime;

  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  bool _isOffline = false;

  @override
  void initState() {
    super.initState();
    _initConnectivity();
    _initWebView();
    _requestAppPermissions();
  }

  /// Request permissions for photo/screenshot uploads in tester tasks
  Future<void> _requestAppPermissions() async {
    try {
      await [
        Permission.camera,
        Permission.photos,
      ].request();
    } catch (e) {
      debugPrint('Permission request error: $e');
    }
  }

  /// Monitor connectivity changes
  void _initConnectivity() {
    _connectivitySubscription = Connectivity()
        .onConnectivityChanged
        .listen((List<ConnectivityResult> results) {
      final isOffline = results.contains(ConnectivityResult.none) ||
          results.isEmpty;
      if (_isOffline != isOffline) {
        setState(() {
          _isOffline = isOffline;
        });

        if (!_isOffline && _hasError) {
          // Connection restored, reload page
          _reloadPage();
        }
      }
    });
  }

  /// Initialize the WebView Controller
  void _initWebView() {
    late final PlatformWebViewControllerCreationParams params;

    if (WebViewPlatform.instance is WebKitWebViewPlatform) {
      params = WebKitWebViewControllerCreationParams(
        allowsInlineMediaPlayback: true,
        mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
      );
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    final WebViewController controller =
        WebViewController.fromPlatformCreationParams(params);

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..setUserAgent(AppConfig.userAgent)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (mounted) {
              setState(() {
                _progress = progress / 100.0;
              });
            }
          },
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = true;
                _hasError = false;
              });
            }
            _injectAuthPageCleanStyle(url);
          },
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
            _injectAuthPageCleanStyle(url);
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('WebView Resource Error: ${error.errorCode} - ${error.description}');
            // Trigger full error screen only for main document errors
            if (error.isForMainFrame ?? true) {
              if (mounted) {
                setState(() {
                  _hasError = true;
                  _errorMessage = error.description;
                  _isLoading = false;
                });
              }
            }
          },
          onNavigationRequest: (NavigationRequest request) async {
            return await _handleNavigationRequest(request);
          },
        ),
      );

    // Platform-specific setup
    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(false);
      final androidController = controller.platform as AndroidWebViewController;
      androidController.setMediaPlaybackRequiresUserGesture(false);
    }

    controller.loadRequest(Uri.parse(AppConfig.initialUrl));
    _controller = controller;
  }

  /// Injects CSS to hide website marketing headers & footers on Login / Signup / Auth pages
  void _injectAuthPageCleanStyle(String url) {
    final lowerUrl = url.toLowerCase();
    if (lowerUrl.contains('/login') ||
        lowerUrl.contains('/signup') ||
        lowerUrl.contains('/register') ||
        lowerUrl.contains('/forgot-password')) {
      _controller.runJavaScript('''
        (function() {
          var id = 'revtail-app-clean-auth-style';
          var style = document.getElementById(id);
          if (!style) {
            style = document.createElement('style');
            style.id = id;
            style.innerHTML = 'header, footer, .revtail-sticky-header, nav.navbar, .navbar { display: none !important; } body, main, .login-wrapper { padding-top: 16px !important; margin-top: 0 !important; }';
            document.head.appendChild(style);
          }
        })();
      ''');
    }
  }

  /// Handle external link clicks (WhatsApp, Tel, Mail, External shopping/brand links)
  Future<NavigationDecision> _handleNavigationRequest(
      NavigationRequest request) async {
    final String url = request.url;
    final Uri uri = Uri.parse(url);

    // 1. WhatsApp Community / Chat links
    if (url.startsWith('whatsapp:') ||
        uri.host.contains('wa.me') ||
        uri.host.contains('chat.whatsapp.com') ||
        uri.host.contains('api.whatsapp.com')) {
      await _launchExternalUrl(uri);
      return NavigationDecision.prevent;
    }

    // 2. Phone dialer
    if (url.startsWith('tel:')) {
      await _launchExternalUrl(uri);
      return NavigationDecision.prevent;
    }

    // 3. Email client
    if (url.startsWith('mailto:')) {
      await _launchExternalUrl(uri);
      return NavigationDecision.prevent;
    }

    // 4. SMS client
    if (url.startsWith('sms:')) {
      await _launchExternalUrl(uri);
      return NavigationDecision.prevent;
    }

    // 5. External domain (e.g. Amazon, Flipkart product link given to tester for review)
    // Open outside so the Revtail tester session is preserved inside the app
    if (uri.scheme == 'http' || uri.scheme == 'https') {
      if (!uri.host.contains(AppConfig.domain) &&
          !uri.host.contains('localhost') &&
          !uri.host.contains('127.0.0.1')) {
        await _launchExternalUrl(uri);
        return NavigationDecision.prevent;
      }
    }

    // Default: allow navigation inside webview for Revtail
    return NavigationDecision.navigate;
  }

  /// Safely launch external applications
  Future<void> _launchExternalUrl(Uri uri) async {
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      debugPrint('Error launching external URL $uri: $e');
    }
  }

  /// Reload the webview page
  Future<void> _reloadPage() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
    });
    try {
      await _controller.reload();
    } catch (e) {
      await _controller.loadRequest(Uri.parse(AppConfig.initialUrl));
    }
  }

  /// Handle Back navigation (Android back button & gesture)
  Future<void> _handlePopScope(bool didPop, dynamic result) async {
    if (didPop) return;

    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return;
    }

    // At root page: double-tap back within 2 seconds to exit app
    final now = DateTime.now();
    if (_lastBackPressTime == null ||
        now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
      _lastBackPressTime = now;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Press back again to exit Revtail'),
            duration: Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
      return;
    }

    // Exit app
    SystemNavigator.pop();
  }

  @override
  void dispose() {
    _connectivitySubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // If offline or failed with main error
    if (_isOffline || _hasError) {
      return PopScope(
        canPop: false,
        onPopInvokedWithResult: _handlePopScope,
        child: NoInternetScreen(
          errorMessage: _errorMessage,
          onRetry: () async {
            final results = await Connectivity().checkConnectivity();
            final offline = results.contains(ConnectivityResult.none) ||
                results.isEmpty;
            if (offline) {
              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Still offline. Please check your connection.'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
              return;
            }
            _reloadPage();
          },
        ),
      );
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: _handlePopScope,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          top: true,
          bottom: false,
          child: Column(
            children: [
              // Top linear loading indicator
              if (_isLoading && _progress < 1.0)
                LinearProgressIndicator(
                  value: _progress,
                  backgroundColor: AppConfig.primaryColor.withValues(alpha: 0.1),
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    AppConfig.accentColor,
                  ),
                  minHeight: 3.0,
                ),

              // WebView with pull to refresh
              Expanded(
                child: RefreshIndicator(
                  color: AppConfig.primaryColor,
                  backgroundColor: Colors.white,
                  onRefresh: _reloadPage,
                  child: WebViewWidget(controller: _controller),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
