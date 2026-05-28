import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../l10n/app_localizations.dart';
import '../widgets/app_button.dart';
import '../widgets/app_card.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key, this.showAsCard = false});
  final bool showAsCard;

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
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
    final api = context.read<ApiService>();
    final t = AppLocalizations.of(context)!;
    setState(() => _submitting = true);
    try {
      await api.submitFeedback(token: token, message: message, rating: _rating);
      if (!mounted) return;
      _messageController.clear();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(t.feedbackSubmitted)));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(t.submitFailed(error.toString()))));
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    final body = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Feedback message input
        Text(
          t.yourFeedback,
          style: theme.textTheme.labelMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: AppTheme.sm),
        TextField(
          controller: _messageController,
          minLines: 3,
          maxLines: 5,
          decoration: InputDecoration(
            hintText: 'Share your thoughts and suggestions...',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            ),
            contentPadding: const EdgeInsets.all(AppTheme.md),
          ),
        ),
        const SizedBox(height: AppTheme.lg),

        // Rating selector
        Text(
          t.rating,
          style: theme.textTheme.labelMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: AppTheme.sm),
        Container(
          padding: const EdgeInsets.all(AppTheme.md),
          decoration: BoxDecoration(
            border: Border.all(color: theme.colorScheme.outline),
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(
              5,
              (index) => InkWell(
                onTap: () => setState(() => _rating = index + 1),
                child: Column(
                  children: [
                    Icon(
                      Icons.star,
                      size: 32,
                      color: _rating > index
                          ? Colors.amber
                          : Colors.grey.shade300,
                    ),
                    const SizedBox(height: AppTheme.xs),
                    Text(
                      '${index + 1}',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: _rating > index
                            ? theme.colorScheme.primary
                            : Colors.grey.shade500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: AppTheme.lg),

        // Submit button
        SizedBox(
          width: double.infinity,
          child: AppButton(
            onPressed: _submitting ? null : _submit,
            isLoading: _submitting,
            icon: Icons.send,
            label: _submitting ? t.submitting : t.submitFeedback,
          ),
        ),
      ],
    );

    if (widget.showAsCard) {
      return AppCard(child: body);
    }

    return Scaffold(
      appBar: AppBar(title: Text(t.anonymousFeedback)),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.lg),
        children: [AppCard(child: body)],
      ),
    );
  }
}
