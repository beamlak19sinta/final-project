import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../services/api_service.dart';
import '../l10n/app_localizations.dart';
import '../widgets/app_button.dart';
import '../widgets/app_card.dart';
import '../widgets/app_loading_overlay.dart';

class HelpDeskScreen extends StatefulWidget {
  const HelpDeskScreen({super.key});

  @override
  State<HelpDeskScreen> createState() => _HelpDeskScreenState();
}

class _HelpDeskScreenState extends State<HelpDeskScreen> {
  final issueCtrl = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    issueCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final citizen = context.watch<CitizenProvider>();
    final token = context.read<AuthProvider>().token;
    final citizenProvider = context.read<CitizenProvider>();
    final api = context.read<ApiService>();
    final t = AppLocalizations.of(context)!;

    Future<void> submitIssue() async {
      final text = issueCtrl.text.trim();
      if (text.isEmpty || token == null) return;
      setState(() => _submitting = true);
      try {
        await api.submitHelpDeskIssue(token: token, question: text);
        issueCtrl.clear();
        await citizenProvider.loadAll(token);
        if (!context.mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(t.issueSubmitted)));
      } catch (e) {
        if (!context.mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
      } finally {
        if (mounted) setState(() => _submitting = false);
      }
    }

    return Scaffold(
      appBar: AppBar(title: Text(t.helpDesk)),
      body: AppLoadingOverlay(
        isLoading: _submitting,
        child: ListView(
          padding: const EdgeInsets.all(AppTheme.lg),
          children: [
            // FAQ Section
            Text(
              t.frequentlyAskedQuestions,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: AppTheme.md),
            if (citizen.helpDeskNotes.isEmpty)
              EmptyStateWidget(
                icon: Icons.help_outline,
                title: t.noDataAvailable,
                message: 'No FAQ items available',
              )
            else
              ...citizen.helpDeskNotes.map(
                (n) => AppCard(
                  margin: const EdgeInsets.only(bottom: AppTheme.md),
                  child: ExpansionTile(
                    title: Text(
                      n.title,
                      style: Theme.of(context).textTheme.titleMedium
                          ?.copyWith(fontWeight: FontWeight.w700),
                    ),
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(AppTheme.md),
                        child: Text(
                          n.content,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: AppTheme.xl),

            // Submit Issue Section
            Text(
              t.submitIssue,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: AppTheme.md),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Describe your issue',
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppTheme.sm),
                  TextField(
                    controller: issueCtrl,
                    minLines: 3,
                    maxLines: 5,
                    decoration: InputDecoration(
                      labelText: t.submitIssue,
                      hintText: 'Describe your issue in detail...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(
                          AppTheme.radiusMd,
                        ),
                      ),
                      contentPadding: const EdgeInsets.all(AppTheme.md),
                    ),
                  ),
                  const SizedBox(height: AppTheme.lg),
                  SizedBox(
                    width: double.infinity,
                    child: AppButton(
                      label: t.sendToSupport,
                      icon: Icons.support_agent_outlined,
                      isLoading: _submitting,
                      onPressed: (_submitting || token == null)
                          ? null
                          : submitIssue,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppTheme.xl),

            // My Issues Section
            Text(
              t.myIssues,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: AppTheme.md),
            if (citizen.myIssues.isEmpty)
              EmptyStateWidget(
                icon: Icons.assignment_outlined,
                title: t.noDataAvailable,
                message: 'No issues submitted yet',
              )
            else
              ...citizen.myIssues.map(
                (q) => AppCard(
                  margin: const EdgeInsets.only(bottom: AppTheme.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Issue header with status
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  q.question,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium
                                      ?.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: AppTheme.xs),
                              ],
                            ),
                          ),
                          const SizedBox(width: AppTheme.md),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppTheme.sm,
                              vertical: AppTheme.xs,
                            ),
                            decoration: BoxDecoration(
                              color: _getStatusColor(q.status)
                                  .withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(
                                AppTheme.radiusSm,
                              ),
                            ),
                            child: Text(
                              q.status,
                              style: TextStyle(
                                color: _getStatusColor(q.status),
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTheme.md),
                      // Reply or no reply message
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppTheme.md),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(
                            AppTheme.radiusMd,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Support Reply',
                              style: Theme.of(context)
                                  .textTheme
                                  .labelSmall
                                  ?.copyWith(
                                color: Colors.grey.shade600,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: AppTheme.xs),
                            Text(
                              q.reply.isEmpty ? t.noReplyYet : q.reply,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: AppTheme.xxxl),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'RESOLVED':
        return Colors.green;
      case 'REJECTED':
        return Colors.red;
      case 'IN_PROGRESS':
        return Colors.orange;
      default:
        return Colors.blue;
    }
  }
}
