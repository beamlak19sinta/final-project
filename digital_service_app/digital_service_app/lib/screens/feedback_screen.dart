import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../ui/common/loading_filled_button.dart';
import '../ui/common/screen_scaffold.dart';
import '../utils/platform_utils.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key, this.showAsCard = false});
  final bool showAsCard;

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _messageController = TextEditingController();
  int _rating = 5;
  bool _submitting = false;

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;
    final token = context.read<AuthProvider>().token;
    setState(() => _submitting = true);
    try {
      await _apiService.submitFeedback(token: token, message: message, rating: _rating);
      if (!mounted) return;
      _messageController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Feedback submitted')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Submit failed: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final token = context.watch<AuthProvider>().token;
    final body = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        TextField(
          controller: _messageController,
          minLines: 3,
          maxLines: 5,
          decoration: const InputDecoration(
            labelText: 'Your feedback',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            const Text('Rating'),
            const SizedBox(width: 12),
            Expanded(
              child: Wrap(
                spacing: 6,
                children: List.generate(5, (i) {
                  final value = i + 1;
                  final selected = value <= _rating;
                  return IconButton(
                    onPressed: _submitting ? null : () => setState(() => _rating = value),
                    icon: Icon(
                      selected ? Icons.star : Icons.star_border,
                      color: selected ? Colors.amber.shade700 : Colors.black45,
                    ),
                    tooltip: '$value',
                  );
                }),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        LoadingFilledButton(
          isLoading: _submitting,
          onPressed: _submitting ? null : _submit,
          loadingLabel: 'Submitting...',
          child: const Text('Submit Feedback'),
        ),
      ],
    );
    if (widget.showAsCard) return Card(child: Padding(padding: const EdgeInsets.all(12), child: body));

    // Keep web UI untouched.
    if (PlatformUtils.isWeb) {
      return Scaffold(
        appBar: AppBar(title: const Text('Anonymous Feedback')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            body,
            const SizedBox(height: 8),
            Text('Session token present: ${token != null ? 'yes' : 'no'}'),
          ],
        ),
      );
    }

    return ScreenScaffold(
      title: 'Anonymous Feedback',
      children: [
        body,
        const SizedBox(height: 8),
        Text(
          token != null ? 'You are logged in.' : 'You can submit anonymously.',
          style: Theme.of(context)
              .textTheme
              .bodySmall
              ?.copyWith(color: Colors.black.withValues(alpha: 0.65)),
        ),
      ],
    );
  }
}
