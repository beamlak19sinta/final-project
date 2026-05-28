import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../widgets/app_card.dart';
import '../l10n/app_localizations.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final token = context.read<AuthProvider>().token;
      if (token != null) {
        context.read<CitizenProvider>().refreshNotifications(token);
      }
    });
  }

  Future<void> _refresh() async {
    if (!mounted) return;
    final token = context.read<AuthProvider>().token;
    if (token != null) {
      final provider = context.read<CitizenProvider>();
      await provider.refreshNotifications(token);
    }
  }

  @override
  Widget build(BuildContext context) {
    final citizen = context.watch<CitizenProvider>();
    final notifications = citizen.notifications;
    final t = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(t.notifications),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: citizen.notificationsLoading ? null : _refresh,
          ),
          if (notifications.any((n) => !n.isRead))
            Builder(
              builder: (context) => IconButton(
                icon: const Icon(Icons.mark_email_read_outlined),
                onPressed: citizen.notificationsLoading
                    ? null
                    : () async {
                        final token = context.read<AuthProvider>().token;
                        if (token != null) {
                          await context
                              .read<CitizenProvider>()
                              .markAllNotificationsAsRead(token);
                        }
                      },
              ),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: citizen.notificationsLoading
            ? const Center(child: CircularProgressIndicator())
            : notifications.isEmpty
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(AppTheme.lg),
                children: [
                  const SizedBox(height: 120),
                  const EmptyStateWidget(
                    icon: Icons.notifications_none,
                    title: 'No notifications yet',
                    message: 'Notifications will appear here when available.',
                  ),
                ],
              )
            : ListView.separated(
                padding: const EdgeInsets.all(AppTheme.lg),
                itemCount: notifications.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final item = notifications[index];
                  return AppCard(
                    margin: const EdgeInsets.only(bottom: AppTheme.md),
                    child: ListTile(
                      tileColor: item.isRead
                          ? Colors.white
                          : Colors.blue.shade50,
                      leading: CircleAvatar(
                        backgroundColor: item.isRead
                            ? Colors.grey.shade200
                            : Theme.of(context).colorScheme.primary,
                        child: Icon(
                          item.type == 'ERROR'
                              ? Icons.error_outline
                              : item.type == 'WARNING'
                              ? Icons.warning_amber_outlined
                              : Icons.notifications_none,
                          color: item.isRead ? Colors.black54 : Colors.white,
                        ),
                      ),
                      title: Text(
                        item.title,
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: item.isRead ? Colors.black87 : Colors.black,
                        ),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 6),
                          Text(
                            item.message,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            item.createdAt != null
                                ? '${item.createdAt!.toLocal()}'.split(' ')[0]
                                : t.unknownDate,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                      trailing: PopupMenuButton<String>(
                        onSelected: (value) async {
                          if (value == 'read') {
                            final token = context.read<AuthProvider>().token;
                            if (token != null) {
                              await context
                                  .read<CitizenProvider>()
                                  .markNotificationAsRead(
                                    token: token,
                                    notificationId: item.id,
                                  );
                            }
                          }
                        },
                        itemBuilder: (_) => [
                          if (!item.isRead)
                            PopupMenuItem(
                              value: 'read',
                              child: Text(t.markAsRead),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
