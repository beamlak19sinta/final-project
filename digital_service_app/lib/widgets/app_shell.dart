import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import '../core/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../l10n/app_localizations.dart';
import '../screens/appointments_screen.dart';
import '../screens/help_desk_screen.dart';
import '../screens/home_screen.dart';
import '../screens/online_services_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/queue_screen.dart';
import '../main.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> with WidgetsBindingObserver {
  int index = 0;
  Timer? timer;
  String? _token;

  void _stopQueueTimer() {
    timer?.cancel();
    timer = null;
  }

  void _startQueueTimerIfNeeded() {
    if (!mounted) return;
    if (_token == null) return;
    if (timer != null) return;
    timer = Timer.periodic(const Duration(seconds: 10), (_) {
      final token = _token;
      if (token == null) return;
      context.read<CitizenProvider>().refreshQueueStatus(token);
    });
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _token = context.read<AuthProvider>().token;
      final token = _token;
      if (token == null) return;
      context.read<CitizenProvider>().loadAll(token);
      _startQueueTimerIfNeeded();
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        _startQueueTimerIfNeeded();
        break;
      case AppLifecycleState.inactive:
      case AppLifecycleState.paused:
      case AppLifecycleState.hidden:
        _stopQueueTimer();
        break;
      case AppLifecycleState.detached:
        _stopQueueTimer();
        break;
    }
  }

  @override
  void dispose() {
    _stopQueueTimer();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  final screens = const [
    HomeScreen(),
    AppointmentsScreen(),
    QueueScreen(),
    OnlineServicesScreen(),
    HelpDeskScreen(),
    ProfileScreen(),
  ];

  void _showLanguageMenu() {
    final t = AppLocalizations.of(context)!;
    final currentLocale = Localizations.localeOf(context);
    final isAmharic = currentLocale.languageCode == 'am';

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              t.language,
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 20),
            _LanguageOption(
              label: 'English',
              flag: '🇬🇧',
              isSelected: !isAmharic,
              onTap: isAmharic
                  ? () {
                      Navigator.pop(context);
                      DigitalServiceApp.setLocale(context, const Locale('en'));
                    }
                  : null,
            ),
            const SizedBox(height: 12),
            _LanguageOption(
              label: 'አማርኛ',
              flag: '🇪🇹',
              isSelected: isAmharic,
              onTap: !isAmharic
                  ? () {
                      Navigator.pop(context);
                      DigitalServiceApp.setLocale(context, const Locale('am'));
                    }
                  : null,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Image.asset(
              'assets/images/logo.png',
              height: 28,
              fit: BoxFit.contain,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                t?.appTitle ?? 'Digital Service',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Center(
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: _showLanguageMenu,
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('🌐', style: TextStyle(fontSize: 18)),
                        const SizedBox(width: 8),
                        Text(
                          Localizations.localeOf(context).languageCode == 'am'
                              ? 'አM'
                              : 'EN',
                          style: theme.textTheme.labelMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: IndexedStack(index: index, children: screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (i) => setState(() => index = i),
        height: 68,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        backgroundColor: theme.colorScheme.surface,
        surfaceTintColor: Colors.transparent,
        indicatorShape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusXl),
        ),
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home),
            label: t?.home ?? 'Home',
          ),
          NavigationDestination(
            icon: const Icon(Icons.calendar_month_outlined),
            selectedIcon: const Icon(Icons.calendar_month),
            label: t?.appointments ?? 'Appointments',
          ),
          NavigationDestination(
            icon: const Icon(Icons.confirmation_number_outlined),
            selectedIcon: const Icon(Icons.confirmation_number),
            label: t?.queue ?? 'Queue',
          ),
          NavigationDestination(
            icon: const Icon(Icons.public_outlined),
            selectedIcon: const Icon(Icons.public),
            label: t?.onlineServices ?? 'Online Services',
          ),
          NavigationDestination(
            icon: const Icon(Icons.support_agent_outlined),
            selectedIcon: const Icon(Icons.support_agent),
            label: t?.helpDesk ?? 'Help Desk',
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            selectedIcon: const Icon(Icons.person),
            label: t?.profile ?? 'Profile',
          ),
        ],
      ),
    );
  }
}

/// Language option tile for language selection
class _LanguageOption extends StatelessWidget {
  const _LanguageOption({
    required this.label,
    required this.flag,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final String flag;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          decoration: BoxDecoration(
            color: isSelected
                ? theme.colorScheme.primary.withValues(alpha: 0.1)
                : Colors.grey.withValues(alpha: 0.05),
            border: Border.all(
              color: isSelected
                  ? theme.colorScheme.primary
                  : Colors.grey.shade300,
              width: isSelected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Text(flag, style: const TextStyle(fontSize: 24)),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  label,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                    color: isSelected
                        ? theme.colorScheme.primary
                        : Colors.grey.shade700,
                  ),
                ),
              ),
              if (isSelected)
                Icon(
                  Icons.check_circle,
                  color: theme.colorScheme.primary,
                  size: 24,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
