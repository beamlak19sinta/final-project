class UserProfile {
  const UserProfile({
    required this.id,
    required this.fullName,
    required this.phoneNumber,
    required this.role,
    required this.createdAt,
  });

  final String id;
  final String fullName;
  final String phoneNumber;
  final String role;
  final DateTime? createdAt;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: (json['id'] ?? '').toString(),
      fullName: (json['fullName'] ?? json['name'] ?? '').toString(),
      phoneNumber: (json['phoneNumber'] ?? '').toString(),
      role: (json['role'] ?? '').toString(),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
    );
  }
}
