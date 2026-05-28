import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../l10n/app_localizations.dart';
import '../ui/common/responsive.dart';
import '../ui/common/language_selector.dart';
import '../utils/platform_utils.dart';
import 'feedback_screen.dart';
import 'notifications_screen.dart';
import 'queue_screen.dart';
import 'online_services_screen.dart';
import 'appointments_screen.dart';
import 'help_desk_screen.dart';
import 'profile_screen.dart';
import '../widgets/app_shell.dart';
import '../utils/translation_helper.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final citizen = context.watch<CitizenProvider>();

    // Keep web UI untouched.
    if (PlatformUtils.isWeb) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Welcome, ${auth.user?.fullName ?? 'Citizen'}',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _StatCard(
                  title: 'Appointments',
                  icon: Icons.calendar_month,
                  value: '${citizen.appointments.length}'),
              _StatCard(
                  title: 'Queue Tickets',
                  icon: Icons.confirmation_number,
                  value: '${citizen.queueHistory.length}'),
              _StatCard(
                  title: 'Online Requests',
                  icon: Icons.public,
                  value: '${citizen.onlineRequests.length}'),
            ],
          ),
          if (citizen.isLoading)
            const Padding(
                padding: EdgeInsets.only(top: 12),
                child: LinearProgressIndicator()),
          if (citizen.error != null)
            Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(citizen.error!,
                    style: const TextStyle(color: Colors.red))),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.notifications_outlined),
              title: Text(
                  'Notifications (${citizen.unreadNotifications} unread)'),
              subtitle: Text(
                citizen.notifications.isEmpty
                    ? 'No notifications yet.'
                    : citizen.notifications.first.message,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              trailing: citizen.unreadNotifications > 0
                  ? CircleAvatar(
                      radius: 12,
                      child: Text(
                        '${citizen.unreadNotifications}',
                        style: const TextStyle(
                            fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    )
                  : null,
              onTap: () {
                final token = auth.token;
                if (token == null) return;
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => NotificationsScreen(token: token),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          const FeedbackScreen(showAsCard: true),
        ],
      );
    }

    final t = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final isAmharic = Localizations.localeOf(context).languageCode == 'am';
    final maxWidth = Responsive.contentMaxWidth(context);

    Future<void> refresh() async {
      final token = auth.token;
      if (token == null) return;
      await context.read<CitizenProvider>().loadAll(token);
    }

    final fullName = auth.user?.fullName.trim();
    final greetingName =
        (fullName != null && fullName.isNotEmpty) ? fullName : t.citizen;

    // Generate mock citizen ID based on phone number or national ID
    final phoneClean = (auth.user?.phoneNumber ?? '0000').replaceAll(RegExp(r'\D'), '');
    final lastFour = phoneClean.length >= 4 ? phoneClean.substring(phoneClean.length - 4) : '0000';
    final mockCitizenId = 'MZ-2026-$lastFour';

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: Colors.white,
        title: Row(
          children: [
            const Icon(Icons.account_balance, size: 20, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                t.appTitle.toUpperCase(),
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                  color: Colors.white,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12.0),
            child: LanguageSelector(),
          ),
        ],
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: refresh,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: maxWidth),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 1. Official Banner / Citizen Profile Info Card
                  Container(
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.15), width: 1.0),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              isAmharic ? 'የዜጋ መለያ ፖርታል' : 'OFFICIAL CITIZEN PORTAL',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: Colors.white.withValues(alpha: 0.75),
                                letterSpacing: 1.0,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.green.shade600,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.verified, size: 10, color: Colors.white),
                                  const SizedBox(width: 4),
                                  Text(
                                    isAmharic ? 'የተረጋገጠ' : 'VERIFIED',
                                    style: const TextStyle(
                                      fontSize: 8,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '${t.welcome},',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.white.withValues(alpha: 0.75),
                          ),
                        ),
                        Text(
                          greetingName,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 0.2,
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Divider(color: Colors.white24, height: 1),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isAmharic ? 'የዜጋ መለያ ቁጥር' : 'CITIZEN ID',
                                  style: TextStyle(
                                    fontSize: 8,
                                    color: Colors.white.withValues(alpha: 0.70),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  mockCitizenId,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  isAmharic ? 'ሀገር' : 'NATIONALITY',
                                  style: TextStyle(
                                    fontSize: 8,
                                    color: Colors.white.withValues(alpha: 0.70),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  isAmharic ? 'ኢትዮጵያ' : 'ETHIOPIA',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Loading/Error indicators
                  if (citizen.isLoading)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: LinearProgressIndicator(minHeight: 2),
                    ),
                  if (citizen.error != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFDE8E8),
                        border: Border.all(color: const Color(0xFFF8B4B4)),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: Color(0xFFC81E1E), size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              citizen.error!,
                              style: const TextStyle(color: Color(0xFFC81E1E), fontSize: 13, fontWeight: FontWeight.w500),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // 2. Active Queue Status Indicator (Warning/Alert layout)
                  if (citizen.activeQueue != null) ...[
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF08A), // Soft yellow background
                        border: Border.all(color: const Color(0xFFEAB308), width: 1.0),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFCA8A04).withValues(alpha: 0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.warning_amber_rounded,
                              color: Color(0xFF854D0E),
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isAmharic ? 'የነቃ የሰልፍ ቲኬት' : 'ACTIVE QUEUE TICKET',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF854D0E),
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${TranslationHelper.translate(context, citizen.activeQueue!.service?.name ?? t.queue)} - #${citizen.activeQueue!.ticketNumber}',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1E293B),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${citizen.activeQueue!.peopleAhead} ${t.peopleAhead}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFF475569),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          OutlinedButton(
                            onPressed: () {
                              final appShell = AppShell.of(context);
                              if (appShell != null) {
                                appShell.setIndex(2); // Queue tab
                              } else {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const QueueScreen(),
                                  ),
                                );
                              }
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF854D0E),
                              side: const BorderSide(color: Color(0xFFCA8A04), width: 1.2),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: Text(
                              isAmharic ? 'ተመልከት' : 'VIEW',
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // 3. Grid Header
                  Text(
                    t.officialServices.toUpperCase(),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: theme.colorScheme.primary,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // 4. Portal Modules Grid (2x2 Grid using clean Rows)
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final w = constraints.maxWidth;
                      final cardWidth = (w - 12) / 2;
                      return Column(
                        children: [
                          Row(
                            children: [
                              _MenuGridCard(
                                title: t.queue,
                                subtitle: isAmharic ? 'ወረፋ ይያዙ / ይከታተሉ' : 'Take & Track Tickets',
                                icon: Icons.confirmation_number_outlined,
                                badgeText: citizen.activeQueue != null ? 'ACTIVE' : null,
                                badgeColor: const Color(0xFFEAB308),
                                width: cardWidth,
                                onTap: () {
                                  final appShell = AppShell.of(context);
                                  if (appShell != null) {
                                    appShell.setIndex(2); // Queue tab
                                  } else {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(builder: (_) => const QueueScreen()),
                                    );
                                  }
                                },
                              ),
                              const SizedBox(width: 12),
                              _MenuGridCard(
                                title: t.onlineServices,
                                subtitle: isAmharic ? 'የመስመር ላይ ማመልከቻ' : 'Submit E-Requests',
                                icon: Icons.public_outlined,
                                badgeText: citizen.onlineRequests.isNotEmpty
                                    ? '${citizen.onlineRequests.length}'
                                    : null,
                                width: cardWidth,
                                onTap: () {
                                  final appShell = AppShell.of(context);
                                  if (appShell != null) {
                                    appShell.setIndex(1); // Services tab
                                  } else {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(builder: (_) => const OnlineServicesScreen()),
                                    );
                                  }
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              _MenuGridCard(
                                title: t.appointments,
                                subtitle: isAmharic ? 'ቀጠሮ ያስይዙ' : 'Book E-Appointments',
                                icon: Icons.calendar_month_outlined,
                                badgeText: citizen.appointments.isNotEmpty
                                    ? '${citizen.appointments.length}'
                                    : null,
                                width: cardWidth,
                                onTap: () => Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => const AppointmentsScreen()),
                                ),
                              ),
                              const SizedBox(width: 12),
                              _MenuGridCard(
                                title: t.helpDesk,
                                subtitle: isAmharic ? 'የእርዳታ ጠረጴዛ' : 'Submit Support Tickets',
                                icon: Icons.support_agent_outlined,
                                width: cardWidth,
                                onTap: () => Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => const HelpDeskScreen()),
                                ),
                              ),
                            ],
                          ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 16),

                  // 5. Notifications Bar
                  Card(
                    elevation: 0,
                    margin: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide(color: Colors.grey.shade300, width: 1.0),
                    ),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(8),
                      onTap: () {
                        final token = auth.token;
                        if (token == null) return;
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => NotificationsScreen(token: token),
                          ),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Icon(
                                Icons.notifications_active_outlined,
                                color: theme.colorScheme.primary,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    t.notifications,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      color: Color(0xFF1E293B),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    citizen.notifications.isEmpty
                                        ? (isAmharic ? 'አዲስ ማሳወቂያ የለም።' : 'No new notifications.')
                                        : citizen.notifications.first.message,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            if (citizen.unreadNotifications > 0)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.red.shade600,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${citizen.unreadNotifications}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            const SizedBox(width: 4),
                            Icon(Icons.chevron_right, color: Colors.grey.shade400, size: 20),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 6. Citizen profile menu button
                  Card(
                    elevation: 0,
                    margin: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide(color: Colors.grey.shade300, width: 1.0),
                    ),
                    child: ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Icon(
                          Icons.person_outline,
                          color: theme.colorScheme.primary,
                          size: 20,
                        ),
                      ),
                      title: Text(
                        t.profile,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      subtitle: Text(
                        isAmharic ? 'የግል መረጃዎችን እና የይለፍ ቃል ያስተዳድሩ' : 'Manage details & password',
                        style: const TextStyle(fontSize: 11),
                      ),
                      trailing: const Icon(Icons.chevron_right, size: 20),
                       onTap: () {
                        final appShell = AppShell.of(context);
                        if (appShell != null) {
                          appShell.setIndex(3); // Profile tab
                        } else {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const ProfileScreen()),
                          );
                        }
                      },
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 7. Feedback Screen
                  const FeedbackScreen(showAsCard: true),
                  const SizedBox(height: 24),

                  // 8. Footer Info
                  Text(
                    isAmharic
                        ? "ዳግማዊ ምኒልክ ዲጂታል መንግስት አገልግሎት ፖርታል\n© 2026 መብቱ በህግ የተጠበቀ ነው።"
                        : "Dagmawi Menelik Digital Government Service Portal\n© 2026 All Rights Reserved.",
                    style: TextStyle(
                      color: Colors.grey.shade500,
                      fontSize: 10,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MenuGridCard extends StatelessWidget {
  const _MenuGridCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.width,
    required this.onTap,
    this.badgeText,
    this.badgeColor,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final double width;
  final VoidCallback onTap;
  final String? badgeText;
  final Color? badgeColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: Colors.grey.shade300, width: 1.0),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          width: width,
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Icon(
                      icon,
                      color: theme.colorScheme.primary,
                      size: 24,
                    ),
                  ),
                  if (badgeText != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: badgeColor ?? theme.colorScheme.primary,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        badgeText!,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey.shade600,
                  height: 1.3,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}



class _StatCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final String value;

  const _StatCard({
    required this.title,
    required this.icon,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Icon(icon, size: 36),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 20)),
          ],
        ),
      ),
    );
  }
}

