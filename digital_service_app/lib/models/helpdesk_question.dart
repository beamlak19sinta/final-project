class HelpDeskQuestion {
  const HelpDeskQuestion({
    required this.id,
    required this.question,
    required this.reply,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final String question;
  final String reply;
  final String status;
  final DateTime? createdAt;

  factory HelpDeskQuestion.fromJson(Map<String, dynamic> json) {
    return HelpDeskQuestion(
      id: (json['id'] ?? '').toString(),
      question: (json['question'] ?? '').toString(),
      reply: (json['reply'] ?? '').toString(),
      status: (json['status'] ?? '').toString(),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
    );
  }
}
