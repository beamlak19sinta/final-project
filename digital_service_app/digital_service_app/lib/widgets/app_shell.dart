import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../l10n/app_localizations.dart';
import '../utils/platform_utils.dart';
import '../screens/appointments_screen.dart';
import '../screens/help_desk_screen.dart';
import '../screens/home_screen.dart';
import '../screens/online_services_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/queue_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  static AppShellState? of(BuildContext context) {
    return context.findAncestorStateOfType<AppShellState>();
  }

  @override
  State<AppShell> createState() => AppShellState();
}

class AppShellState extends State<AppShell> {
  int index = 0;
  Timer? timer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = context.read<AuthProvider>().token;
      if (token != null) {
        context.read<CitizenProvider>().loadAll(token);
        timer = Timer.periodic(const Duration(seconds: 10), (_) {
          context.read<CitizenProvider>().refreshQueueStatus(token);
        });
      }
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  void setIndex(int i) {
    if (!PlatformUtils.isWeb) {
      HapticFeedback.selectionClick();
    }
    setState(() => index = i);
  }

  final webScreens = const [
    HomeScreen(),
    AppointmentsScreen(),
    QueueScreen(),
    OnlineServicesScreen(),
    HelpDeskScreen(),
    ProfileScreen(),
  ];

  final mobileScreens = const [
    HomeScreen(),
    OnlineServicesScreen(),
    QueueScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    // Keep web UI untouched.
    if (PlatformUtils.isWeb) {
      return Scaffold(
        body: webScreens[index],
        bottomNavigationBar: NavigationBar(
          selectedIndex: index,
          onDestinationSelected: (i) => setState(() => index = i),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.calendar_month_outlined), label: 'Appts'),
            NavigationDestination(icon: Icon(Icons.confirmation_number_outlined), label: 'Queue'),
            NavigationDestination(icon: Icon(Icons.public_outlined), label: 'Online'),
            NavigationDestination(icon: Icon(Icons.support_agent_outlined), label: 'Help'),
            NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
          ],
        ),
      );
    }

    final t = AppLocalizations.of(context)!;
    return Scaffold(
      body: IndexedStack(index: index, children: mobileScreens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: setIndex,
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home),
            label: t.home,
          ),
          NavigationDestination(
            icon: const Icon(Icons.public_outlined),
            selectedIcon: const Icon(Icons.public),
            label: t.services,
          ),
          NavigationDestination(
            icon: const Icon(Icons.confirmation_number_outlined),
            selectedIcon: const Icon(Icons.confirmation_number),
            label: t.queue,
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            selectedIcon: const Icon(Icons.person),
            label: t.profile,
          ),
        ],
      ),
    );
  }
}
