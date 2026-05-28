import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../providers/auth_provider.dart';
import '../l10n/app_localizations.dart';
import '../widgets/app_button.dart';
import '../widgets/app_card.dart';
import '../main.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _nationalId = TextEditingController();
  final _password = TextEditingController();
  bool _showPassword = false;
  bool _agreedToTerms = false;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _nationalId.dispose();
    _password.dispose();
    super.dispose();
  }

  String? _validateName(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return 'Please enter your full name.';
    if (text.length < 3) return 'Name must be at least 3 characters.';
    return null;
  }

  String? _validatePhone(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return 'Please enter your phone number.';
    final normalized = text.replaceAll(RegExp(r'[\s-]+'), '');
    final phoneRegExp = RegExp(r'^\+?\d{9,15}$');
    if (!phoneRegExp.hasMatch(normalized)) {
      return 'Enter a valid phone number like +2519XXXXXXXX.';
    }
    return null;
  }

  String? _validateNationalId(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return 'Please enter your national ID.';
    if (text.length < 5) return 'National ID must be at least 5 characters.';
    return null;
  }

  String? _validatePassword(String? value) {
    final text = value ?? '';
    if (text.isEmpty) return 'Please enter a password.';
    if (text.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (!RegExp(r'^(?=.*[A-Za-z])(?=.*\d).+$').hasMatch(text)) {
      return 'Use letters and numbers in your password.';
    }
    return null;
  }

  void _showMessage(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Theme.of(context).colorScheme.error : null,
      ),
    );
  }

  Future<void> _submitRegistration() async {
    final auth = context.read<AuthProvider>();
    if (!_formKey.currentState!.validate()) return;
    if (!_agreedToTerms) {
      _showMessage('You must agree to the terms to continue.', isError: true);
      return;
    }

    final ok = await auth.register(
      name: _name.text.trim(),
      phone: _phone.text.trim(),
      nationalId: _nationalId.text.trim(),
      password: _password.text,
    );

    if (!mounted) return;
    if (ok) {
      Navigator.pop(context);
    } else {
      _showMessage(
        auth.error ?? 'Registration failed. Please try again.',
        isError: true,
      );
    }
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
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: theme.colorScheme.primary),
          onPressed: () => Navigator.pop(context),
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
            constraints: const BoxConstraints(maxWidth: 480),
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
                  t.createCitizenAccount,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: theme.colorScheme.primary,
                    letterSpacing: -0.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.xs),
                Text(
                  t.registerSubtitle,
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
                        _FormField(
                          label: t.fullName,
                          hint: t.fullName,
                          icon: Icons.badge_outlined,
                          controller: _name,
                          validator: _validateName,
                        ),
                        const SizedBox(height: AppTheme.xl),
                        _FormField(
                          label: t.phoneNumber,
                          hint: '+251 9XX XXX XXXX',
                          icon: Icons.phone_outlined,
                          controller: _phone,
                          keyboardType: TextInputType.phone,
                          validator: _validatePhone,
                        ),
                        const SizedBox(height: AppTheme.xl),
                        _FormField(
                          label: t.nationalId,
                          hint: t.nationalId,
                          icon: Icons.credit_card_outlined,
                          controller: _nationalId,
                          keyboardType: TextInputType.number,
                          validator: _validateNationalId,
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
                          validator: _validatePassword,
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
                        ),
                        const SizedBox(height: AppTheme.lg),
                        CheckboxListTile(
                          value: _agreedToTerms,
                          contentPadding: EdgeInsets.zero,
                          title: Text(
                            'I agree to the terms and privacy policy',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          activeColor: theme.colorScheme.primary,
                          controlAffinity: ListTileControlAffinity.leading,
                          onChanged: auth.isLoading
                              ? null
                              : (value) {
                                  setState(() {
                                    _agreedToTerms = value ?? false;
                                  });
                                },
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
                          label: auth.isLoading ? t.loading : t.register,
                          icon: Icons.person_add_alt_1,
                          isLoading: auth.isLoading,
                          onPressed: auth.isLoading ? null : _submitRegistration,
                        ),
                        const SizedBox(height: AppTheme.md),
                        TextButton(
                          onPressed: auth.isLoading
                              ? null
                              : () => Navigator.pop(context),
                          child: Text(
                            t.alreadyHaveAccount,
                            style: TextStyle(
                              color: theme.colorScheme.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
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

class _FormField extends StatelessWidget {
  const _FormField({
    required this.label,
    required this.hint,
    required this.icon,
    required this.controller,
    this.keyboardType = TextInputType.text,
    this.validator,
  });

  final String label;
  final String hint;
  final IconData icon;
  final TextEditingController controller;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.primary,
          ),
        ),
        const SizedBox(height: AppTheme.sm),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon),
          ),
        ),
      ],
    );
  }
}
