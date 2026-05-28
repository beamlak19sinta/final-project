import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'providers/auth_provider.dart';
import 'providers/citizen_provider.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'services/api_service.dart';
import 'services/session_service.dart';
import 'widgets/app_shell.dart';
import 'l10n/app_localizations.dart';
import 'utils/platform_utils.dart';
import 'ui/mobile/mobile_theme.dart';
import 'design_system/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final String? langCode = prefs.getString('language_code');
  final initialLocale = langCode != null ? Locale(langCode) : const Locale('en');
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) =>
              AuthProvider(ApiService(), SessionService())..restoreSession(),
        ),
        ChangeNotifierProvider(create: (_) => CitizenProvider(ApiService())),
      ],
      child: DigitalServiceApp(initialLocale: initialLocale),
    ),
  );
}

class DigitalServiceApp extends StatefulWidget {
  final Locale initialLocale;
  const DigitalServiceApp({super.key, required this.initialLocale});

  static void setLocale(BuildContext context, Locale newLocale) async {
    final state = context.findAncestorStateOfType<_DigitalServiceAppState>();
    if (state != null) {
      state.setLocale(newLocale);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('language_code', newLocale.languageCode);
    }
  }

  @override
  State<DigitalServiceApp> createState() => _DigitalServiceAppState();
}

class _DigitalServiceAppState extends State<DigitalServiceApp> {
  Locale? _locale;

  @override
  void initState() {
    super.initState();
    _locale = widget.initialLocale;
  }

  void setLocale(Locale locale) {
    setState(() => _locale = locale);
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF0B2C4A),
      primary: const Color(0xFF0B2C4A),
      brightness: Brightness.light,
    );
    // IMPORTANT: the web version is already working well. We intentionally keep
    // the existing theme as-is for Web, and layer enhancements ONLY for Android.
    final baseTheme = ThemeData(
      colorScheme: colorScheme,
      useMaterial3: true,
      // Ensures Ethiopic (Amharic) glyphs render in release even if the device
      // doesn't ship an Ethiopic system font.
      textTheme: GoogleFonts.notoSansEthiopicTextTheme(),
      primaryTextTheme: GoogleFonts.notoSansEthiopicTextTheme(),
      scaffoldBackgroundColor: const Color(0xFFF4F6F9),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF0B2C4A),
        foregroundColor: Colors.white,
        centerTitle: false,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: Colors.white,
        shadowColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(color: Colors.grey.shade300, width: 1.0),
        ),
        margin: const EdgeInsets.symmetric(vertical: 6),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey.shade300, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey.shade300, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFF0B2C4A), width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 12,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: const Color(0xFF0B2C4A),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFF0B2C4A),
          side: const BorderSide(color: Color(0xFF0B2C4A), width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );

    final androidBaseTheme = AppTheme.webLight();
    final theme = PlatformUtils.isAndroid
        ? MobileTheme.build(
            base: androidBaseTheme,
            colorScheme: androidBaseTheme.colorScheme,
          )
        : baseTheme;

    return MaterialApp(
      onGenerateTitle: (context) => AppLocalizations.of(context)!.appTitle,
      locale: _locale,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('en'), Locale('am')],
      theme: theme,
      routes: {
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/forgot': (_) => const ForgotPasswordScreen(),
      },
      home: const RootScreen(),
    );
  }
}

class RootScreen extends StatelessWidget {
  const RootScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (auth.isAuthenticated) return const AppShell();
    return const LoginScreen();
  }
}
