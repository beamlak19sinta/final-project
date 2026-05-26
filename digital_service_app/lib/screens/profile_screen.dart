import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../main.dart';
import 'package:digital_service_app/l10n/app_localizations.dart';
import '../widgets/app_button.dart';
import '../widgets/app_card.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _nationalId = TextEditingController();
  final _current = TextEditingController();
  final _next = TextEditingController();

  bool _isLoading = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final user = context.read<AuthProvider>().user;
    if (_name.text.isEmpty) _name.text = user?.fullName ?? '';
    if (_phone.text.isEmpty) _phone.text = user?.phoneNumber ?? '';
    if (_nationalId.text.isEmpty) _nationalId.text = user?.nationalId ?? '';
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _nationalId.dispose();
    _current.dispose();
    _next.dispose();
    super.dispose();
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

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final token = auth.token;
    final api = context.read<ApiService>();
    final theme = Theme.of(context);
    final t = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(t.profile)),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(AppTheme.lg),
              children: [
                // Profile header card
                AppCard(
                  child: Column(
                    children: [
                      // Avatar
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withValues(
                            alpha: 0.12,
                          ),
                          borderRadius: BorderRadius.circular(
                            AppTheme.radiusXl,
                          ),
                        ),
                        child: Icon(
                          Icons.person,
                          size: 40,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                      const SizedBox(height: AppTheme.lg),
                      Text(
                        auth.user?.fullName ?? '',
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppTheme.xs),
                      Text(
                        auth.user?.phoneNumber ?? '',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: Colors.grey.shade600,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      if (auth.user?.nationalId != null &&
                          auth.user!.nationalId!.isNotEmpty)
                        Column(
                          children: [
                            const SizedBox(height: AppTheme.xs),
                            Text(
                              auth.user!.nationalId!,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: Colors.grey.shade500,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: AppTheme.xl),

                // Personal information section
                Text(
                  t.editDetails,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: AppTheme.md),
                AppCard(
                  child: Column(
                    children: [
                      _ProfileField(label: t.fullName, controller: _name),
                      const SizedBox(height: AppTheme.md),
                      _ProfileField(label: t.phoneNumber, controller: _phone),
                      const SizedBox(height: AppTheme.md),
                      _ProfileField(
                        label: t.nationalId,
                        controller: _nationalId,
                      ),
                      const SizedBox(height: AppTheme.lg),
                      SizedBox(
                        width: double.infinity,
                        child: AppButton(
                          onPressed: token == null
                              ? null
                              : () async {
                                  setState(() => _isLoading = true);
                                  try {
                                    final user = await api.updateProfile(
                                      token: token,
                                      name: _name.text.trim(),
                                      phoneNumber: _phone.text.trim(),
                                    );
                                    if (!context.mounted) return;
                                    await context
                                        .read<AuthProvider>()
                                        .replaceUser(user);
                                    _showFeedback(t.profileUpdatedSuccessfully);
                                  } catch (e) {
                                    _showFeedback(e.toString(), isError: true);
                                  } finally {
                                    if (mounted) {
                                      setState(() => _isLoading = false);
                                    }
                                  }
                                },
                          icon: Icons.save_outlined,
                          label: t.updateProfile,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppTheme.xl),

                // Security section
                Text(
                  t.security,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: AppTheme.md),
                AppCard(
                  child: Column(
                    children: [
                      _ProfileField(
                        label: t.currentPassword,
                        controller: _current,
                        isPassword: true,
                      ),
                      const SizedBox(height: AppTheme.md),
                      _ProfileField(
                        label: t.newPassword,
                        controller: _next,
                        isPassword: true,
                      ),
                      const SizedBox(height: AppTheme.lg),
                      SizedBox(
                        width: double.infinity,
                        child: AppButton(
                          onPressed: token == null
                              ? null
                              : () async {
                                  setState(() => _isLoading = true);
                                  try {
                                    await api.changePassword(
                                      token: token,
                                      currentPassword: _current.text,
                                      newPassword: _next.text,
                                    );
                                    _showFeedback(
                                      t.passwordChangedSuccessfully,
                                    );
                                    _current.clear();
                                    _next.clear();
                                  } catch (e) {
                                    _showFeedback(e.toString(), isError: true);
                                  } finally {
                                    if (mounted) {
                                      setState(() => _isLoading = false);
                                    }
                                  }
                                },
                          icon: Icons.lock_reset,
                          label: t.changePassword,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppTheme.xl),

                // Preferences section
                Text(
                  t.preferences,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: AppTheme.md),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.language,
                            color: theme.colorScheme.primary,
                          ),
                          const SizedBox(width: AppTheme.lg),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  t.language,
                                  style: theme.textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Text(
                                  'English • አማርኛ',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SegmentedButton<String>(
                            segments: const [
                              ButtonSegment(value: 'en', label: Text('EN')),
                              ButtonSegment(value: 'am', label: Text('አM')),
                            ],
                            selected: {
                              Localizations.localeOf(context).languageCode,
                            },
                            onSelectionChanged: (Set<String> newSelection) {
                              DigitalServiceApp.setLocale(
                                context,
                                Locale(newSelection.first),
                              );
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppTheme.xl),

                // Logout button
                SizedBox(
                  width: double.infinity,
                  child: AppButton(
                    onPressed: () => context.read<AuthProvider>().logout(),
                    icon: Icons.logout,
                    destructive: true,
                    label: t.logout,
                  ),
                ),
                const SizedBox(height: AppTheme.xxxl),
              ],
            ),
    );
  }
}

class _ProfileField extends StatefulWidget {
  final String label;
  final TextEditingController controller;
  final bool isPassword;

  const _ProfileField({
    required this.label,
    required this.controller,
    this.isPassword = false,
  });

  @override
  State<_ProfileField> createState() => _ProfileFieldState();
}

class _ProfileFieldState extends State<_ProfileField> {
  late bool _showPassword;

  @override
  void initState() {
    super.initState();
    _showPassword = !widget.isPassword;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: theme.textTheme.labelMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: AppTheme.sm),
        TextField(
          controller: widget.controller,
          obscureText: widget.isPassword && !_showPassword,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppTheme.md,
              vertical: AppTheme.md,
            ),
            suffixIcon: widget.isPassword
                ? Material(
                    type: MaterialType.transparency,
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _showPassword = !_showPassword;
                        });
                      },
                      child: Icon(
                        _showPassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        color: theme.colorScheme.outline,
                      ),
                    ),
                  )
                : null,
          ),
        ),
      ],
    );
  }
}
