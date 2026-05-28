import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:digital_service_app/l10n/app_localizations.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/citizen_provider.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'services/api_service.dart';
import 'services/session_service.dart';
import 'widgets/app_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  final prefs = await SharedPreferences.getInstance();
  final String? savedLocaleCode = prefs.getString('language_code');
  Locale? initialLocale;
  if (savedLocaleCode != null) {
    initialLocale = Locale(savedLocaleCode);
  }

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiService>(
          create: (_) => ApiService(),
          dispose: (_, api) => api.dispose(),
        ),
        Provider<SessionService>(create: (_) => SessionService()),
        ChangeNotifierProvider(
          create: (context) => AuthProvider(
            context.read<ApiService>(),
            context.read<SessionService>(),
          )..restoreSession(),
        ),
        ChangeNotifierProvider(
          create: (context) => CitizenProvider(context.read<ApiService>()),
        ),
      ],
      child: DigitalServiceApp(initialLocale: initialLocale),
    ),
  );
}

class DigitalServiceApp extends StatefulWidget {
  final Locale? initialLocale;
  const DigitalServiceApp({super.key, this.initialLocale});

  static void setLocale(BuildContext context, Locale newLocale) {
    _DigitalServiceAppState? state = context
        .findAncestorStateOfType<_DigitalServiceAppState>();
    state?.setLocale(newLocale);
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

  void setLocale(Locale locale) async {
    setState(() {
      _locale = locale;
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language_code', locale.languageCode);
  }

  @override
  Widget build(BuildContext context) {
    final effectiveLocale =
        _locale ?? WidgetsBinding.instance.platformDispatcher.locale;
    final isAmharic = effectiveLocale.languageCode == 'am';

    const webBackground = Color(0xFFFFFFFF);
    const webForeground = Color(0xFF0F172A);
    const webBorder = Color(0xFFE2E8F0);
    const webMuted = Color(0xFFF1F5F9);
    const webMutedForeground = Color(0xFF64748B);

    final colorScheme = const ColorScheme.light(
      primary: AppColors.primaryBlue,
      onPrimary: Colors.white,
      secondary: AppColors.ethiopianYellow,
      onSecondary: webForeground,
      error: AppColors.ethiopianRed,
      onError: Colors.white,
      surface: webBackground,
      onSurface: webForeground,
    ).copyWith(
      outline: webBorder,
      surfaceContainerHighest: webMuted,
      surfaceContainerLow: webMuted,
      surfaceContainer: webMuted,
      onSurfaceVariant: webMutedForeground,
    );

    // Use Ethiopic font as the primary family when Amharic is selected to avoid
    // mixed-font weight/spacing artifacts on some Android devices.
    final baseTextTheme = isAmharic
        ? GoogleFonts.notoSansEthiopicTextTheme()
        : GoogleFonts.interTextTheme();
    final ethiopicFallback = GoogleFonts.notoSansEthiopic().fontFamily;
    final textTheme = baseTextTheme.apply(
      bodyColor: colorScheme.onSurface,
      displayColor: colorScheme.onSurface,
    );

    final isAndroid =
        !kIsWeb && defaultTargetPlatform == TargetPlatform.android;

    return MaterialApp(
      // Used by Android task switcher; keep localized.
      onGenerateTitle: (context) =>
          AppLocalizations.of(context)?.appTitle ?? 'Digital Service',
      locale: _locale,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('en'), Locale('am')],
      theme: AppTheme.createTheme(
        colorScheme: colorScheme,
        baseTextTheme: textTheme,
        fontFamily: isAmharic
            ? GoogleFonts.notoSansEthiopic().fontFamily
            : GoogleFonts.inter().fontFamily,
        fontFamilyFallback: ethiopicFallback != null
            ? [ethiopicFallback, 'Noto Sans Ethiopic', 'Roboto']
            : ['Noto Sans Ethiopic', 'Roboto'],
        isAndroid: isAndroid,
      ),
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
