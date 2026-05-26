class HelpDeskNote {
  const HelpDeskNote({
    required this.id,
    required this.title,
    required this.content,
  });

  final String id;
  final String title;
  final String content;

  factory HelpDeskNote.fromJson(Map<String, dynamic> json) {
    return HelpDeskNote(
      id: (json['id'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      content: (json['content'] ?? '').toString(),
    );
  }
}
