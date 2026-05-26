import 'service_item.dart';

class QueueTicket {
  const QueueTicket({
    required this.id,
    required this.ticketNumber,
    required this.status,
    required this.peopleAhead,
    required this.createdAt,
    required this.service,
  });

  final String id;
  final int ticketNumber;
  final String status;
  final int peopleAhead;
  final DateTime? createdAt;
  final ServiceItem? service;

  factory QueueTicket.fromJson(Map<String, dynamic> json) {
    final serviceJson = json['service'] as Map<String, dynamic>?;
    return QueueTicket(
      id: (json['id'] ?? '').toString(),
      ticketNumber: (json['ticketNumber'] as num?)?.toInt() ?? 0,
      status: (json['status'] ?? '').toString(),
      peopleAhead: (json['peopleAhead'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
      service: serviceJson == null ? null : ServiceItem.fromJson(serviceJson),
    );
  }
}
