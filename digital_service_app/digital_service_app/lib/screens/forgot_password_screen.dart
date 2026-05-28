import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../ui/common/loading_filled_button.dart';
import '../ui/common/screen_scaffold.dart';
import '../utils/platform_utils.dart';

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

    // Keep web UI untouched.
    if (PlatformUtils.isWeb) {
      return Scaffold(
        appBar: AppBar(title: const Text('Forgot Password')),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              TextField(
                  controller: _phone,
                  decoration: const InputDecoration(labelText: 'Phone Number')),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: auth.isLoading
                    ? null
                    : () async {
                        final t = await context
                            .read<AuthProvider>()
                            .forgotPassword(_phone.text.trim());
                        setState(() => token = t);
                        _token.text = t ?? '';
                      },
                child: Text(auth.isLoading ? 'Generating...' : 'Generate Reset Token'),
              ),
              if (token != null)
                Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Text('Reset token: $token')),
              const SizedBox(height: 20),
              TextField(
                  controller: _token,
                  decoration: const InputDecoration(labelText: 'Reset Token')),
              const SizedBox(height: 12),
              TextField(
                controller: _newPassword,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'New Password'),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: auth.isLoading
                    ? null
                    : () async {
                        final ok = await context.read<AuthProvider>().resetPassword(
                              token: _token.text.trim(),
                              newPassword: _newPassword.text,
                            );
                        if (!ok || !context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Password reset successful')));
                        Navigator.pop(context);
                      },
                child: Text(auth.isLoading ? 'Resetting...' : 'Reset Password'),
              ),
              if (auth.error != null)
                Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child:
                        Text(auth.error!, style: const TextStyle(color: Colors.red))),
            ],
          ),
        ),
      );
    }

    Future<void> generate() async {
      final messenger = ScaffoldMessenger.of(context);
      final t = await context
          .read<AuthProvider>()
          .forgotPassword(_phone.text.trim());
      setState(() => token = t);
      _token.text = t ?? '';
      if (!mounted) return;
      if (t != null) {
        messenger.showSnackBar(
          const SnackBar(content: Text('Reset token generated')),
        );
      }
    }

    Future<void> reset() async {
      final messenger = ScaffoldMessenger.of(context);
      final nav = Navigator.of(context);
      final ok = await context.read<AuthProvider>().resetPassword(
            token: _token.text.trim(),
            newPassword: _newPassword.text,
          );
      if (!ok || !mounted) return;
      messenger.showSnackBar(
        const SnackBar(content: Text('Password reset successful')),
      );
      nav.pop();
    }

    return ScreenScaffold(
      title: 'Forgot Password',
      children: [
        TextField(
          controller: _phone,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            labelText: 'Phone Number',
          ),
        ),
        const SizedBox(height: 12),
        LoadingFilledButton(
          isLoading: auth.isLoading,
          onPressed: auth.isLoading ? null : generate,
          loadingLabel: 'Generating...',
          child: const Text('Generate Reset Token'),
        ),
        if (token != null)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Card(
              child: ListTile(
                title: const Text('Reset token'),
                subtitle: Text(token!),
              ),
            ),
          ),
        const SizedBox(height: 16),
        TextField(
          controller: _token,
          decoration: const InputDecoration(labelText: 'Reset Token'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _newPassword,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'New Password'),
        ),
        const SizedBox(height: 12),
        LoadingFilledButton(
          isLoading: auth.isLoading,
          onPressed: auth.isLoading ? null : reset,
          loadingLabel: 'Resetting...',
          child: const Text('Reset Password'),
        ),
        if (auth.error != null)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Text(
              auth.error!,
              style: TextStyle(
                color: Theme.of(context).colorScheme.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
      ],
    );
  }
}
