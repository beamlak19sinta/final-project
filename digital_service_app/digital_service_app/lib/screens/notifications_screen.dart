import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/citizen_provider.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key, required this.token});
  final String token;

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<CitizenProvider>().refreshNotifications(widget.token);
    });
  }

  Future<void> _refresh() async {
    await context.read<CitizenProvider>().refreshNotifications(widget.token);
  }

  @override
  Widget build(BuildContext context) {
    final citizen = context.watch<CitizenProvider>();
    final notifications = citizen.notifications;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: citizen.notificationsLoading ? null : _refresh,
          ),
          if (notifications.any((n) => !n.isRead))
            IconButton(
              icon: const Icon(Icons.mark_email_read_outlined),
              onPressed: citizen.notificationsLoading
                  ? null
                  : () async {
                      await context.read<CitizenProvider>().markAllNotificationsAsRead(widget.token);
                    },
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
                    children: const [
                      SizedBox(height: 120),
                      Center(child: Text('No notifications yet.', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600))),
                    ],
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: notifications.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = notifications[index];
                      return Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(18),
                          side: BorderSide(color: item.isRead ? Colors.grey.shade200 : Theme.of(context).colorScheme.primary, width: 1.5),
                        ),
                        child: ListTile(
                          tileColor: item.isRead ? Colors.white : Colors.blue.shade50,
                          leading: CircleAvatar(
                            backgroundColor: item.isRead ? Colors.grey.shade200 : Theme.of(context).colorScheme.primary,
                            child: Icon(item.type == 'ERROR' ? Icons.error_outline : item.type == 'WARNING' ? Icons.warning_amber_outlined : Icons.notifications_none, color: item.isRead ? Colors.black54 : Colors.white),
                          ),
                          title: Text(item.title, style: TextStyle(fontWeight: FontWeight.w700, color: item.isRead ? Colors.black87 : Colors.black)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 6),
                              Text(item.message, maxLines: 3, overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 8),
                              Text(
                                item.createdAt != null ? '${item.createdAt!.toLocal()}'.split(' ')[0] : 'Unknown date',
                                style: const TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                          trailing: PopupMenuButton<String>(
                            onSelected: (value) async {
                              if (value == 'read') {
                                await context.read<CitizenProvider>().markNotificationAsRead(token: widget.token, notificationId: item.id);
                              }
                            },
                            itemBuilder: (_) => [
                              if (!item.isRead)
                                const PopupMenuItem(value: 'read', child: Text('Mark as read')),
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
