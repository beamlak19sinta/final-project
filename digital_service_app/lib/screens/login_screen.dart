import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../providers/auth_provider.dart';
import '../l10n/app_localizations.dart';
import '../widgets/app_button.dart';
import '../widgets/app_card.dart';
import '../main.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneOrEmail = TextEditingController();
  final _password = TextEditingController();
  bool _showPassword = false;

  @override
  void dispose() {
    _phoneOrEmail.dispose();
    _password.dispose();
    super.dispose();
  }

  String? _validatePhoneOrEmail(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) {
      return 'Please enter your phone number or email.';
    }
    if (text.contains('@')) {
      final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
      if (!emailRegex.hasMatch(text)) {
        return 'Please enter a valid email address.';
      }
    } else {
      final phoneRegex = RegExp(r'^\+?[0-9]{8,15}$');
      if (!phoneRegex.hasMatch(text)) {
        return 'Please enter a valid phone number.';
      }
    }
    return null;
  }

  String? _validatePassword(String? value) {
    final text = value ?? '';
    if (text.isEmpty) {
      return 'Please enter your password.';
    }
    if (text.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    return null;
  }

  void _showFeedback(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Theme.of(context).colorScheme.error : null,
      ),
    );
  }

  Future<void> _submitLogin() async {
    final auth = context.read<AuthProvider>();
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final ok = await auth.login(_phoneOrEmail.text.trim(), _password.text);

    if (!mounted) return;
    if (!ok) {
      _showFeedback(
        auth.error ?? 'Unable to sign in. Please try again.',
        isError: true,
      );
      return;
    }

    Navigator.of(context).pushReplacementNamed('/');
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final t = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final isAmharic = Localizations.localeOf(context).languageCode == 'am';

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        shape: Border(
          bottom: BorderSide(
            color: Colors.grey.shade300,
            width: 1.0,
          ),
        ),
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
              child: Image.asset(
                'assets/images/logo.png',
                width: 32,
                height: 32,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: AppTheme.sm),
            Expanded(
              child: Text(
                t.appTitle,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.primary,
                  fontSize: 14,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: AppTheme.md),
            child: PopupMenuButton<Locale>(
              icon: Icon(Icons.language, color: theme.colorScheme.primary),
              tooltip: t.language,
              onSelected: (Locale locale) {
                DigitalServiceApp.setLocale(context, locale);
              },
              itemBuilder: (BuildContext context) => <PopupMenuEntry<Locale>>[
                PopupMenuItem<Locale>(
                  value: const Locale('en'),
                  child: Text(
                    'English',
                    style: TextStyle(
                      fontWeight: !isAmharic ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
                PopupMenuItem<Locale>(
                  value: const Locale('am'),
                  child: Text(
                    'አማርኛ (Amharic)',
                    style: TextStyle(
                      fontWeight: isAmharic ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppTheme.lg),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(AppTheme.lg),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                      border: Border.all(
                        color: Colors.grey.shade300,
                        width: 1.0,
                      ),
                    ),
                    child: Image.asset(
                      'assets/images/logo.png',
                      width: 64,
                      height: 64,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                const SizedBox(height: AppTheme.xl),
                Text(
                  t.citizenPortal,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: theme.colorScheme.primary,
                    letterSpacing: -0.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.xs),
                Text(
                  t.signInToAccessServices,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade600,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.xl),
                AppCard(
                  padding: const EdgeInsets.all(AppTheme.xl),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          t.phoneNumber,
                          style: theme.textTheme.labelLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                        const SizedBox(height: AppTheme.sm),
                        TextFormField(
                          controller: _phoneOrEmail,
                          keyboardType: TextInputType.text,
                          decoration: const InputDecoration(
                            hintText: '+251 9XX XXX XXXX or email',
                            prefixIcon: Icon(Icons.phone_outlined),
                          ),
                          validator: _validatePhoneOrEmail,
                        ),
                        const SizedBox(height: AppTheme.xl),
                        Text(
                          t.password,
                          style: theme.textTheme.labelLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                        const SizedBox(height: AppTheme.sm),
                        TextFormField(
                          controller: _password,
                          obscureText: !_showPassword,
                          decoration: InputDecoration(
                            hintText: '••••••••',
                            prefixIcon: const Icon(Icons.lock_outline),
                            suffixIcon: InkWell(
                              onTap: () {
                                setState(() {
                                  _showPassword = !_showPassword;
                                });
                              },
                              borderRadius: BorderRadius.circular(
                                AppTheme.radiusSm,
                              ),
                              child: Icon(
                                _showPassword
                                    ? Icons.visibility
                                    : Icons.visibility_off,
                                color: Colors.grey.shade600,
                                size: 20,
                              ),
                            ),
                          ),
                          validator: _validatePassword,
                        ),
                        if (auth.error != null) ...[
                          const SizedBox(height: AppTheme.lg),
                          Container(
                            padding: const EdgeInsets.all(AppTheme.md),
                            decoration: BoxDecoration(
                              color: Colors.red.withAlpha(20),
                              borderRadius: BorderRadius.circular(
                                AppTheme.radiusSm,
                              ),
                              border: Border.all(
                                color: Colors.red.withAlpha(80),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.error_outline,
                                  color: Colors.red.shade600,
                                  size: 18,
                                ),
                                const SizedBox(width: AppTheme.md),
                                Expanded(
                                  child: Text(
                                    auth.error!,
                                    style: TextStyle(
                                      color: Colors.red.shade600,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: AppTheme.xl),
                        AppButton(
                          label: auth.isLoading ? t.loading : t.login,
                          icon: Icons.login,
                          isLoading: auth.isLoading,
                          onPressed: auth.isLoading ? null : _submitLogin,
                        ),
                        const SizedBox(height: AppTheme.md),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            TextButton(
                              onPressed: () =>
                                  Navigator.pushNamed(context, '/forgot'),
                              child: Text(
                                t.forgotPassword,
                                style: TextStyle(
                                  color: theme.colorScheme.primary,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            TextButton(
                              onPressed: () =>
                                  Navigator.pushNamed(context, '/register'),
                              child: Text(
                                t.register,
                                style: TextStyle(
                                  color: theme.colorScheme.primary,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AppTheme.xxl),
                Text(
                  "Official Portal of the Digital Government\n© 2026 All Rights Reserved",
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade500,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
