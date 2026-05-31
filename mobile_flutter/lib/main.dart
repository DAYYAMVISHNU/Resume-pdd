import 'dart:io';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

final InAppLocalhostServer localhostServer = InAppLocalhostServer(documentRoot: 'assets/web');

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Start the localhost server to serve the React assets offline
  if (!kIsWeb) {
    await localhostServer.start();
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Resume Analysis',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  final GlobalKey webViewKey = GlobalKey();
  InAppWebViewController? webViewController;
  int _loadingProgress = 0;
  bool _hasError = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f1a),
      body: SafeArea(
        child: Stack(
          children: [
            Opacity(
              opacity: _hasError ? 0.0 : 1.0,
              child: InAppWebView(
                key: webViewKey,
                initialUrlRequest: URLRequest(
                  url: WebUri("http://localhost:8080/index.html"),
                ),
                initialSettings: InAppWebViewSettings(
                  javaScriptEnabled: true,
                  transparentBackground: true,
                  domStorageEnabled: true,
                  allowFileAccessFromFileURLs: true,
                  allowUniversalAccessFromFileURLs: true,
                  mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
                  clearCache: true,
                ),
                onWebViewCreated: (controller) {
                  webViewController = controller;
                  
                  controller.addJavaScriptHandler(handlerName: 'downloadPdf', callback: (args) async {
                    try {
                      final String base64Str = args[0];
                      final String filename = args[1];
                      
                      final bytes = base64Decode(base64Str);
                      final dir = await getTemporaryDirectory();
                      final file = File('${dir.path}/$filename');
                      await file.writeAsBytes(bytes);
                      
                      await Share.shareXFiles([XFile(file.path)], text: 'Here is the generated resume report');
                    } catch (e) {
                      debugPrint('Error sharing PDF: $e');
                    }
                  });
                },
                onLoadStart: (controller, url) {
                  setState(() {
                    _hasError = false;
                    _loadingProgress = 0;
                  });
                },
                onProgressChanged: (controller, progress) {
                  setState(() {
                    _loadingProgress = progress;
                  });
                },
                onLoadStop: (controller, url) {
                  setState(() {
                    _loadingProgress = 100;
                  });
                },
                onReceivedError: (controller, request, error) {
                  if (request.isForMainFrame ?? true) {
                    setState(() {
                      _hasError = true;
                    });
                  }
                },
              ),
            ),
            if (_loadingProgress < 100 && !_hasError)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: LinearProgressIndicator(
                  value: _loadingProgress / 100.0,
                  backgroundColor: Colors.transparent,
                  color: Colors.indigoAccent,
                  minHeight: 3,
                ),
              ),
            if (_loadingProgress < 10 && !_hasError)
              const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: Colors.indigoAccent),
                    SizedBox(height: 20),
                    Text(
                      'Loading Offline App...',
                      style: TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                  ],
                ),
              ),
            if (_hasError)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(28.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline_rounded,
                          color: Colors.redAccent, size: 64),
                      const SizedBox(height: 20),
                      const Text(
                        'Failed to load offline app',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 28),
                      ElevatedButton.icon(
                        onPressed: () {
                          setState(() {
                            _hasError = false;
                            _loadingProgress = 0;
                          });
                          webViewController?.reload();
                        },
                        icon: const Icon(Icons.refresh_rounded),
                        label: const Text('Retry'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.indigoAccent,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
