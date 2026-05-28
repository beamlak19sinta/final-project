import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../l10n/app_localizations.dart';
import '../ui/common/language_selector.dart';
import '../ui/common/loading_filled_button.dart';
import '../ui/common/responsive.dart';
import '../utils/platform_utils.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscure = true;

  @override
  void dispose() {
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final t = AppLocalizations.of(context)!;

    // Keep web UI untouched.
    if (PlatformUtils.isWeb) {
      return _buildWeb(context, auth, t);
    }

    return _buildMobile(context, auth, t);
  }

  Widget _buildWeb(BuildContext context, AuthProvider auth, AppLocalizations t) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Theme.of(context).colorScheme.primary.withValues(alpha: 0.12),
              Theme.of(context).scaffoldBackgroundColor,
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 22,
                            backgroundColor: Theme.of(
                              context,
                            ).colorScheme.primary.withValues(alpha: 0.12),
                            child: Icon(
                              Icons.account_balance,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Citizen Portal',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text('Sign in to access services'),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      TextField(
                        controller: _phone,
                        keyboardType: TextInputType.phone,
                        decoration: InputDecoration(
                          labelText: t.phoneNumber,
                          prefixIcon: Icon(Icons.phone_outlined),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _password,
                        obscureText: true,
                        decoration: InputDecoration(
                          labelText: t.password,
                          prefixIcon: Icon(Icons.lock_outline),
                        ),
                      ),
                      if (auth.error != null) ...[
                        const SizedBox(height: 10),
                        Text(
                          auth.error!,
                          style: const TextStyle(color: Colors.red),
                        ),
                      ],
                      const SizedBox(height: 14),
                      FilledButton(
                        onPressed: auth.isLoading
                            ? null
                            : () async {
                                final ok = await context
                                    .read<AuthProvider>()
                                    .login(_phone.text.trim(), _password.text);
                                if (ok && context.mounted) {
                                  Navigator.of(
                                    context,
                                  ).pushReplacementNamed('/');
                                }
                              },
                        child: Text(auth.isLoading ? t.loading : t.login),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          TextButton(
                            onPressed: () =>
                                Navigator.pushNamed(context, '/forgot'),
                            child: Text(t.forgotPassword),
                          ),
                          TextButton(
                            onPressed: () =>
                                Navigator.pushNamed(context, '/register'),
                            child: Text(t.register),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMobile(
    BuildContext context,
    AuthProvider auth,
    AppLocalizations t,
  ) {
    final maxWidth = Responsive.contentMaxWidth(context);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isAmharic = Localizations.localeOf(context).languageCode == 'am';

    Future<void> submit() async {
      FocusScope.of(context).unfocus();
      if (!(_formKey.currentState?.validate() ?? false)) return;
      final ok = await context
          .read<AuthProvider>()
          .login(_phone.text.trim(), _password.text);
      if (!context.mounted) return;
      if (ok) {
        Navigator.of(context).pushReplacementNamed('/');
      } else if (auth.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(auth.error!),
          ),
        );
      }
    }

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(24, 128, 24, 24),
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: maxWidth),
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(32),
                      border: Border.all(color: colorScheme.outline),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.18),
                          blurRadius: 32,
                          offset: const Offset(0, 18),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(32),
                      child: Material(
                        color: colorScheme.surface,
                        child: Form(
                          key: _formKey,
                          autovalidateMode: AutovalidateMode.onUserInteraction,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Container(
                                color: colorScheme.primary,
                                padding: const EdgeInsets.all(32),
                                child: Column(
                                  children: [
                                    Image.asset(
                                      'assets/images/app_icon.png',
                                      width: 64,
                                      height: 64,
                                      fit: BoxFit.contain,
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      isAmharic ? 'ዳግማዊ ምኒልክ' : 'Dagmawi Menelik',
                                      textAlign: TextAlign.center,
                                      style: theme.textTheme.titleLarge?.copyWith(
                                        fontWeight: FontWeight.w900,
                                        color: colorScheme.onPrimary,
                                        letterSpacing: -0.2,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Portal Access',
                                      textAlign: TextAlign.center,
                                      style: theme.textTheme.bodyMedium?.copyWith(
                                        color: colorScheme.onPrimary.withValues(alpha: 0.70),
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(32),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    if (auth.error != null) ...[
                                      Container(
                                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                                        decoration: BoxDecoration(
                                          color: colorScheme.error,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          auth.error!,
                                          textAlign: TextAlign.center,
                                          style: theme.textTheme.bodyMedium?.copyWith(
                                            color: colorScheme.onError,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 24),
                                    ],
                                    Text(
                                      t.phoneNumber.toUpperCase(),
                                      style: theme.textTheme.labelMedium?.copyWith(
                                        color: colorScheme.onSurface.withValues(alpha: 0.80),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    TextFormField(
                                      controller: _phone,
                                      keyboardType: TextInputType.phone,
                                      textInputAction: TextInputAction.next,
                                      decoration: const InputDecoration(
                                        hintText: '0911XXXXXX',
                                        prefixIcon: Icon(Icons.phone_outlined),
                                      ),
                                      validator: (v) {
                                        final value = (v ?? '').trim();
                                        if (value.isEmpty) return '${t.phoneNumber} is required';
                                        if (value.length < 9) return 'Enter a valid phone number';
                                        return null;
                                      },
                                    ),
                                    const SizedBox(height: 24),
                                    Text(
                                      t.password.toUpperCase(),
                                      style: theme.textTheme.labelMedium?.copyWith(
                                        color: colorScheme.onSurface.withValues(alpha: 0.80),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    TextFormField(
                                      controller: _password,
                                      obscureText: _obscure,
                                      textInputAction: TextInputAction.done,
                                      onFieldSubmitted: (_) => submit(),
                                      decoration: InputDecoration(
                                        hintText: '••••••••',
                                        prefixIcon: const Icon(Icons.lock_outline),
                                        suffixIcon: IconButton(
                                          onPressed: () => setState(() => _obscure = !_obscure),
                                          icon: Icon(
                                            _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                          ),
                                          tooltip: _obscure ? 'Show password' : 'Hide password',
                                        ),
                                      ),
                                      validator: (v) {
                                        if ((v ?? '').isEmpty) return '${t.password} is required';
                                        if ((v ?? '').length < 4) return 'Password is too short';
                                        return null;
                                      },
                                    ),
                                  ],
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.fromLTRB(32, 0, 32, 32),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    LoadingFilledButton(
                                      isLoading: auth.isLoading,
                                      onPressed: submit,
                                      loadingLabel: t.loading,
                                      child: Text(
                                        t.login,
                                        style: theme.textTheme.titleMedium?.copyWith(
                                          fontWeight: FontWeight.w900,
                                          color: colorScheme.onPrimary,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    TextButton(
                                      onPressed: auth.isLoading ? null : () => Navigator.pushNamed(context, '/forgot'),
                                      child: Text(t.forgotPassword),
                                    ),
                                    TextButton(
                                      onPressed: auth.isLoading ? null : () => Navigator.pushNamed(context, '/register'),
                                      child: Text(t.register),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Positioned(
              left: 0,
              right: 0,
              top: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(24, 14, 24, 14),
                decoration: BoxDecoration(
                  color: colorScheme.surface.withValues(alpha: 0.85),
                  border: Border(
                    bottom: BorderSide(color: colorScheme.outline),
                  ),
                ),
                child: Row(
                  children: [
                    Image.asset(
                      'assets/images/app_icon.png',
                      width: 44,
                      height: 44,
                      fit: BoxFit.contain,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        isAmharic ? 'ዳግማዊ ምኒልክ' : 'Dagmawi Menelik',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const LanguageSelector(),
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
