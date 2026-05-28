import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../l10n/app_localizations.dart';
import '../ui/common/loading_filled_button.dart';
import '../ui/common/screen_scaffold.dart';
import '../ui/common/language_selector.dart';
import '../utils/platform_utils.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _profileFormKey = GlobalKey<FormState>();
  final _passwordFormKey = GlobalKey<FormState>();
  bool _savingProfile = false;
  bool _savingPassword = false;
  bool _obscureCurrent = true;
  bool _obscureNext = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final user = context.read<AuthProvider>().user;
    _name.text = user?.fullName ?? '';
    _phone.text = user?.phoneNumber ?? '';
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _current.dispose();
    _next.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final token = auth.token;
    final authProvider = context.read<AuthProvider>();

    // Keep web UI untouched.
    if (PlatformUtils.isWeb) {
      return Scaffold(
        appBar: AppBar(title: const Text('Profile')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            ListTile(
                title: Text(auth.user?.fullName ?? ''),
                subtitle: Text(auth.user?.phoneNumber ?? '')),
            const SizedBox(height: 10),
            TextField(controller: _name, decoration: const InputDecoration(labelText: 'Name')),
            const SizedBox(height: 10),
            TextField(controller: _phone, decoration: const InputDecoration(labelText: 'Phone')),
            const SizedBox(height: 10),
            FilledButton(
              onPressed: token == null
                  ? null
                  : () async {
                      final user = await ApiService().updateProfile(
                          token: token,
                          name: _name.text.trim(),
                          phoneNumber: _phone.text.trim());
                      if (!context.mounted) return;
                      await authProvider.replaceUser(user);
                    },
              child: const Text('Update Profile'),
            ),
            const Divider(height: 24),
            TextField(
                controller: _current,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Current Password')),
            const SizedBox(height: 10),
            TextField(
                controller: _next,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'New Password')),
            const SizedBox(height: 10),
            FilledButton(
              onPressed: token == null
                  ? null
                  : () async {
                      await ApiService().changePassword(
                          token: token,
                          currentPassword: _current.text,
                          newPassword: _next.text);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Password updated')));
                      }
                    },
              child: const Text('Change Password'),
            ),
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: () => context.read<AuthProvider>().logout(),
              child: const Text('Logout'),
            ),
          ],
        ),
      );
    }

    final t = AppLocalizations.of(context)!;
    final isAmharic = Localizations.localeOf(context).languageCode == 'am';

    Future<void> updateProfile() async {
      final messenger = ScaffoldMessenger.of(context);
      FocusScope.of(context).unfocus();
      if (token == null) return;
      if (!(_profileFormKey.currentState?.validate() ?? false)) return;
      setState(() => _savingProfile = true);
      try {
        final user = await ApiService().updateProfile(
          token: token,
          name: _name.text.trim(),
          phoneNumber: _phone.text.trim(),
        );
        if (!mounted) return;
        await authProvider.replaceUser(user);
        messenger.showSnackBar(
          SnackBar(
            content: Text(isAmharic ? 'መገለጫዎ በተሳካ ሁኔታ ተሻሽሏል' : 'Profile updated successfully'),
            backgroundColor: const Color(0xFF0B2C4A),
          ),
        );
      } catch (e) {
        if (!mounted) return;
        messenger.showSnackBar(
          SnackBar(
            content: Text(isAmharic ? 'ማሻሻል አልተሳካም: $e' : 'Update failed: $e'),
            backgroundColor: Colors.red.shade700,
          ),
        );
      } finally {
        if (mounted) setState(() => _savingProfile = false);
      }
    }

    Future<void> changePassword() async {
      final messenger = ScaffoldMessenger.of(context);
      FocusScope.of(context).unfocus();
      if (token == null) return;
      if (!(_passwordFormKey.currentState?.validate() ?? false)) return;
      setState(() => _savingPassword = true);
      try {
        await ApiService().changePassword(
          token: token,
          currentPassword: _current.text,
          newPassword: _next.text,
        );
        _current.clear();
        _next.clear();
        if (!mounted) return;
        messenger.showSnackBar(
          SnackBar(
            content: Text(isAmharic ? 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል' : 'Password updated successfully'),
            backgroundColor: const Color(0xFF0B2C4A),
          ),
        );
      } catch (e) {
        if (!mounted) return;
        messenger.showSnackBar(
          SnackBar(
            content: Text(isAmharic ? 'የይለፍ ቃል መቀየር አልተሳካም: $e' : 'Password change failed: $e'),
            backgroundColor: Colors.red.shade700,
          ),
        );
      } finally {
        if (mounted) setState(() => _savingPassword = false);
      }
    }

    // Citizen Info Mock Data
    final phoneClean = (auth.user?.phoneNumber ?? '0000').replaceAll(RegExp(r'\D'), '');
    final lastFour = phoneClean.length >= 4 ? phoneClean.substring(phoneClean.length - 4) : '0000';
    final mockCitizenId = 'MZ-2026-$lastFour';

    return ScreenScaffold(
      title: t.profile,
      actions: const [
        Padding(
          padding: EdgeInsets.only(right: 12.0),
          child: LanguageSelector(),
        ),
      ],
      children: [
        // 1. CITIZEN CARD STUB
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade300, width: 1.0),
          ),
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0B2C4A).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.person,
                  color: Color(0xFF0B2C4A),
                  size: 36,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      auth.user?.fullName.toUpperCase() ?? '',
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 15,
                        color: Color(0xFF0B2C4A),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${isAmharic ? "መለያ ቁጥር" : "CITIZEN ID"}: $mockCitizenId',
                      style: const TextStyle(
                        fontSize: 10,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFCA8A04),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.verified_user_outlined, size: 10, color: Colors.green.shade700),
                        const SizedBox(width: 4),
                        Text(
                          isAmharic ? 'የጸደቀ የዜግነት መገለጫ' : 'Verified Citizen Status',
                          style: TextStyle(fontSize: 10, color: Colors.green.shade700, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // 2. PROFILE DETAILS FORM
        Text(
          t.profileDetails.toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0B2C4A),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade300, width: 1.0),
          ),
          child: Form(
            key: _profileFormKey,
            autovalidateMode: AutovalidateMode.onUserInteraction,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    t.fullName,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0B2C4A),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _name,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.person_outline, size: 20),
                  ),
                  style: const TextStyle(fontSize: 13),
                  validator: (v) =>
                      (v ?? '').trim().isEmpty ? '${t.fullName} is required' : null,
                ),
                const SizedBox(height: 14),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    t.phoneNumber,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0B2C4A),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _phone,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.phone_outlined, size: 20),
                  ),
                  style: const TextStyle(fontSize: 13),
                  validator: (v) {
                    final value = (v ?? '').trim();
                    if (value.isEmpty) return '${t.phoneNumber} is required';
                    if (value.length < 9) return 'Enter a valid phone number';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                LoadingFilledButton(
                  isLoading: _savingProfile,
                  onPressed: token == null ? null : updateProfile,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF0B2C4A),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    elevation: 0,
                  ),
                  child: Text(
                    t.updateProfile.toUpperCase(),
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 24),

        // 3. SECURITY / PASSWORD FORM
        Text(
          t.security.toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0B2C4A),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade300, width: 1.0),
          ),
          child: Form(
            key: _passwordFormKey,
            autovalidateMode: AutovalidateMode.onUserInteraction,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    t.currentPassword,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0B2C4A),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _current,
                  obscureText: _obscureCurrent,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.lock_outline, size: 20),
                    suffixIcon: IconButton(
                      onPressed: () =>
                          setState(() => _obscureCurrent = !_obscureCurrent),
                      icon: Icon(
                        _obscureCurrent
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        size: 20,
                      ),
                    ),
                  ),
                  style: const TextStyle(fontSize: 13),
                  validator: (v) =>
                      (v ?? '').isEmpty ? '${t.currentPassword} is required' : null,
                ),
                const SizedBox(height: 14),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    t.newPassword,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0B2C4A),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _next,
                  obscureText: _obscureNext,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.lock_reset_outlined, size: 20),
                    suffixIcon: IconButton(
                      onPressed: () => setState(() => _obscureNext = !_obscureNext),
                      icon: Icon(
                        _obscureNext
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        size: 20,
                      ),
                    ),
                  ),
                  style: const TextStyle(fontSize: 13),
                  validator: (v) {
                    if ((v ?? '').isEmpty) return '${t.newPassword} is required';
                    if ((v ?? '').length < 4) return 'Password is too short';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                LoadingFilledButton(
                  isLoading: _savingPassword,
                  onPressed: token == null ? null : changePassword,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF0B2C4A),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    elevation: 0,
                  ),
                  child: Text(
                    t.changePassword.toUpperCase(),
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 24),

        // 4. LOGOUT BUTTON
        OutlinedButton.icon(
          onPressed: () => context.read<AuthProvider>().logout(),
          icon: const Icon(Icons.logout, size: 18),
          label: Text(
            t.logout.toUpperCase(),
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
          ),
          style: OutlinedButton.styleFrom(
            foregroundColor: Colors.red.shade700,
            side: BorderSide(color: Colors.red.shade200, width: 1.0),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
        ),
        const SizedBox(height: 12),
      ],
    );
  }
}
