import 'service_item.dart';

class OnlineRequestItem {
  const OnlineRequestItem({
    required this.id,
    required this.status,
    required this.remarks,
    required this.createdAt,
    required this.service,
  });

  final String id;
  final String status;
  final String remarks;
  final DateTime? createdAt;
  final ServiceItem? service;

  factory OnlineRequestItem.fromJson(Map<String, dynamic> json) {
    final serviceJson = json['service'] as Map<String, dynamic>?;
    return OnlineRequestItem(
      id: (json['id'] ?? '').toString(),
      status: (json['status'] ?? '').toString(),
      remarks: (json['remarks'] ?? '').toString(),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
      service: serviceJson == null ? null : ServiceItem.fromJson(serviceJson),
    );
  }
}
