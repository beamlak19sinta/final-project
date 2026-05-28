import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../providers/auth_provider.dart';
import '../l10n/app_localizations.dart';
import '../widgets/app_button.dart';
import '../widgets/app_card.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _phone = TextEditingController();
  final _token = TextEditingController();
  final _newPassword = TextEditingController();
  String? token;

  @override
  void dispose() {
    _phone.dispose();
    _token.dispose();
    _newPassword.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final t = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

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
        title: Text(
          t.forgotPasswordTitle,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.primary,
          ),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppTheme.lg),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  t.forgotPasswordTitle,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: theme.colorScheme.primary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.sm),
                Text(
                  'Enter your registered phone number to request a secure reset token.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade600,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.xl),
                
                // Request Token card
                AppCard(
                  padding: const EdgeInsets.all(AppTheme.xl),
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
                      TextField(
                        controller: _phone,
                        keyboardType: TextInputType.phone,
                        decoration: const InputDecoration(
                          hintText: '+251 9XX XXX XXXX',
                          prefixIcon: Icon(Icons.phone_outlined),
                        ),
                      ),
                      const SizedBox(height: AppTheme.xl),
                      AppButton(
                        onPressed: auth.isLoading
                            ? null
                            : () async {
                                final tok = await context
                                    .read<AuthProvider>()
                                    .forgotPassword(_phone.text.trim());
                                if (!mounted) return;
                                setState(() => token = tok);
                                _token.text = tok ?? '';
                              },
                        isLoading: auth.isLoading,
                        icon: Icons.key_outlined,
                        label: auth.isLoading ? t.generating : t.generateResetToken,
                      ),
                      if (token != null) ...[
                        const SizedBox(height: AppTheme.lg),
                        Container(
                          padding: const EdgeInsets.all(AppTheme.md),
                          decoration: BoxDecoration(
                            color: Colors.blue.withAlpha(20),
                            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                            border: Border.all(
                              color: Colors.blue.withAlpha(80),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                t.resetToken,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.blue,
                                ),
                              ),
                              const SizedBox(height: AppTheme.xs),
                              SelectableText(
                                token!,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1.5,
                                  color: theme.colorScheme.primary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                
                const SizedBox(height: AppTheme.md),
                
                // Perform Reset card
                AppCard(
                  padding: const EdgeInsets.all(AppTheme.xl),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        t.resetToken,
                        style: theme.textTheme.labelLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                      const SizedBox(height: AppTheme.sm),
                      TextField(
                        controller: _token,
                        decoration: const InputDecoration(
                          hintText: 'Enter your reset token',
                          prefixIcon: Icon(Icons.vpn_key_outlined),
                        ),
                      ),
                      const SizedBox(height: AppTheme.xl),
                      Text(
                        t.newPassword,
                        style: theme.textTheme.labelLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                      const SizedBox(height: AppTheme.sm),
                      TextField(
                        controller: _newPassword,
                        obscureText: true,
                        decoration: const InputDecoration(
                          hintText: '••••••••',
                          prefixIcon: Icon(Icons.lock_outline),
                        ),
                      ),
                      const SizedBox(height: AppTheme.xl),
                      AppButton(
                        onPressed: auth.isLoading
                            ? null
                            : () async {
                                final ok = await context
                                    .read<AuthProvider>()
                                    .resetPassword(
                                      token: _token.text.trim(),
                                      newPassword: _newPassword.text,
                                    );
                                if (!ok || !context.mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text(t.passwordResetSuccessful)),
                                );
                                Navigator.pop(context);
                              },
                        isLoading: auth.isLoading,
                        icon: Icons.lock_reset,
                        label: auth.isLoading ? t.resetting : t.resetPassword,
                      ),
                      if (auth.error != null) ...[
                        const SizedBox(height: AppTheme.lg),
                        Container(
                          padding: const EdgeInsets.all(AppTheme.md),
                          decoration: BoxDecoration(
                            color: Colors.red.withAlpha(20),
                            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
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
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
