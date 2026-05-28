class NotificationItem {
  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.createdAt,
    required this.relatedId,
  });

  final String id;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final DateTime? createdAt;
  final String? relatedId;

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: (json['id'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      message: (json['message'] ?? '').toString(),
      type: (json['type'] ?? '').toString(),
      isRead: (json['isRead'] as bool?) ?? false,
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
      relatedId: json['relatedId']?.toString(),
    );
  }
}
