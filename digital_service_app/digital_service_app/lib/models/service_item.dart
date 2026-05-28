class ServiceItem {
  const ServiceItem({
    required this.id,
    required this.name,
    required this.description,
    required this.mode,
    required this.availability,
    this.sectorName,
  });

  final String id;
  final String name;
  final String description;
  final String mode;
  final String availability;
  final String? sectorName;

  factory ServiceItem.fromJson(Map<String, dynamic> json) {
    final sector = json['sector'];
    String? sectorName;
    if (json['sectorName'] != null) {
      sectorName = json['sectorName']?.toString();
    } else if (sector is Map<String, dynamic>) {
      sectorName = sector['name']?.toString();
    }

    return ServiceItem(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      mode: (json['mode'] ?? '').toString(),
      availability: (json['availability'] ?? '').toString(),
      sectorName: sectorName,
    );
  }
}
