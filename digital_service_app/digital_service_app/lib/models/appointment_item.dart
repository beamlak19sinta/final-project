import 'service_item.dart';

class AppointmentItem {
  const AppointmentItem({
    required this.id,
    required this.date,
    required this.timeSlot,
    required this.status,
    required this.service,
    required this.rejectionReason,
  });

  final String id;
  final DateTime? date;
  final String timeSlot;
  final String status;
  final ServiceItem? service;
  final String rejectionReason;

  factory AppointmentItem.fromJson(Map<String, dynamic> json) {
    final serviceJson = json['service'] as Map<String, dynamic>?;
    return AppointmentItem(
      id: (json['id'] ?? '').toString(),
      date: DateTime.tryParse((json['date'] ?? '').toString()),
      timeSlot: (json['timeSlot'] ?? '').toString(),
      status: (json['status'] ?? '').toString(),
      service: serviceJson == null ? null : ServiceItem.fromJson(serviceJson),
      rejectionReason: (json['rejectionReason'] ?? '').toString(),
    );
  }
}
