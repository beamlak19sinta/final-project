import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../l10n/app_localizations.dart';
import '../widgets/app_card.dart';
import 'feedback_screen.dart';
import 'notifications_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    final fullName = context.select<AuthProvider, String?>(
      (auth) => auth.user?.fullName,
    );

    final appointmentsCount = context.select<CitizenProvider, int>(
      (citizen) => citizen.appointments.length,
    );
    final queueHistoryCount = context.select<CitizenProvider, int>(
      (citizen) => citizen.queueHistory.length,
    );
    final onlineRequestsCount = context.select<CitizenProvider, int>(
      (citizen) => citizen.onlineRequests.length,
    );
    final isLoading = context.select<CitizenProvider, bool>(
      (citizen) => citizen.isLoading,
    );
    final errorText = context.select<CitizenProvider, String?>(
      (citizen) => citizen.error,
    );
    final unreadNotifications = context.select<CitizenProvider, int>(
      (citizen) => citizen.unreadNotifications,
    );
    final latestNotification = context.select<CitizenProvider, String>(
      (citizen) => citizen.notifications.isNotEmpty
          ? citizen.notifications.first.message
          : t.noNotificationsYet,
    );
    final theme = Theme.of(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 140,
            floating: false,
            pinned: true,
            backgroundColor: theme.colorScheme.primary,
            surfaceTintColor: Colors.transparent,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                '${t.welcome}, ${fullName ?? t.citizen}',
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  fontSize: 18,
                ),
              ),
              titlePadding: const EdgeInsets.only(
                left: AppTheme.lg,
                bottom: AppTheme.lg,
              ),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(
                    'assets/images/dashboard_image.png',
                    fit: BoxFit.cover,
                    filterQuality: FilterQuality.high,
                    color: Colors.black.withValues(alpha: 0.2),
                    colorBlendMode: BlendMode.darken,
                  ),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          theme.colorScheme.primary,
                          theme.colorScheme.primary.withValues(alpha: 0.6),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(AppTheme.lg),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Section header
                Padding(
                  padding: const EdgeInsets.only(
                    top: AppTheme.lg,
                    bottom: AppTheme.lg,
                  ),
                  child: Text(
                    t.services,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.3,
                    ),
                  ),
                ),

                // Stat cards row 1
                Row(
                  children: [
                    Expanded(
                      child: ModernStatCard(
                        title: t.appointments,
                        icon: Icons.calendar_month,
                        value: appointmentsCount.toString(),
                        color: theme.colorScheme.primary,
                        onTap: () {
                          // Navigate to appointments if needed
                        },
                      ),
                    ),
                    const SizedBox(width: AppTheme.md),
                    Expanded(
                      child: ModernStatCard(
                        title: t.queue,
                        icon: Icons.confirmation_number,
                        value: queueHistoryCount.toString(),
                        color: theme.colorScheme.secondary,
                        onTap: () {
                          // Navigate to queue if needed
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppTheme.md),

                // Stat cards row 2
                ModernStatCard(
                  title: t.onlineServices,
                  icon: Icons.public,
                  value: onlineRequestsCount.toString(),
                  color: theme.colorScheme.tertiary,
                  onTap: () {
                    // Navigate to online services if needed
                  },
                ),

                // Loading indicator
                if (isLoading)
                  Padding(
                    padding: const EdgeInsets.only(top: AppTheme.lg),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      child: LinearProgressIndicator(
                        minHeight: 4,
                        backgroundColor: theme.colorScheme.primary.withValues(
                          alpha: 0.1,
                        ),
                        valueColor: AlwaysStoppedAnimation(
                          theme.colorScheme.primary,
                        ),
                      ),
                    ),
                  ),

                // Error message
                if (errorText != null)
                  Padding(
                    padding: const EdgeInsets.only(top: AppTheme.lg),
                    child: Container(
                      padding: const EdgeInsets.all(AppTheme.md),
                      decoration: BoxDecoration(
                        color: Colors.red.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        border: Border.all(
                          color: Colors.red.withValues(alpha: 0.2),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.error_outline,
                            color: Colors.red.shade600,
                            size: 20,
                          ),
                          const SizedBox(width: AppTheme.md),
                          Expanded(
                            child: Text(
                              errorText,
                              style: TextStyle(
                                color: Colors.red.shade600,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                const SizedBox(height: AppTheme.xxl),

                // Notifications card
                _NotificationCard(
                  unreadCount: unreadNotifications,
                  latestNotification: latestNotification,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const NotificationsScreen(),
                      ),
                    );
                  },
                ),

                const SizedBox(height: AppTheme.xxl),

                // Feedback section
                const FeedbackScreen(showAsCard: true),

                const SizedBox(height: AppTheme.xl),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

/// Notification card widget with modern styling
class _NotificationCard extends StatefulWidget {
  const _NotificationCard({
    required this.unreadCount,
    required this.latestNotification,
    required this.onTap,
  });

  final int unreadCount;
  final String latestNotification;
  final VoidCallback onTap;

  @override
  State<_NotificationCard> createState() => _NotificationCardState();
}

class _NotificationCardState extends State<_NotificationCard> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final t = AppLocalizations.of(context)!;

    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: AppTheme.durationFast,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
            boxShadow: [
              BoxShadow(
                color: theme.colorScheme.primary.withValues(
                  alpha: _hovered ? 0.12 : 0.08,
                ),
                blurRadius: _hovered ? 12 : 8,
                offset: _hovered ? const Offset(0, 4) : const Offset(0, 2),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: Padding(
              padding: const EdgeInsets.all(AppTheme.lg),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(AppTheme.md),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    ),
                    child: Icon(
                      Icons.notifications_outlined,
                      color: theme.colorScheme.primary,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: AppTheme.lg),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              t.notifications,
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            if (widget.unreadCount > 0) ...[
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppTheme.sm,
                                  vertical: AppTheme.xs,
                                ),
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.error,
                                  borderRadius: BorderRadius.circular(
                                    AppTheme.radiusSm,
                                  ),
                                ),
                                child: Text(
                                  '${widget.unreadCount}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: AppTheme.sm),
                        Text(
                          widget.latestNotification,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.grey.shade600,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppTheme.md),
                  Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: Colors.grey.shade400,
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
