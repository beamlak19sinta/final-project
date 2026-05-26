import 'service_item.dart';

class ServiceSector {
  const ServiceSector({
    required this.id,
    required this.name,
    required this.description,
    required this.services,
  });

  final String id;
  final String name;
  final String description;
  final List<ServiceItem> services;

  factory ServiceSector.fromJson(Map<String, dynamic> json) {
    final servicesJson = (json['services'] as List<dynamic>? ?? const []);
    return ServiceSector(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      services: servicesJson
          .whereType<Map<String, dynamic>>()
          .map(ServiceItem.fromJson)
          .toList(),
    );
  }
}
