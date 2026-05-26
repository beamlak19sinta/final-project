import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../services/api_service.dart';
import '../l10n/app_localizations.dart';
import '../ui/common/screen_scaffold.dart';
import '../ui/common/language_selector.dart';
import '../utils/platform_utils.dart';
import '../utils/translation_helper.dart';

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

    // Keep web UI untouched.
    if (PlatformUtils.isWeb) {
      return Scaffold(
        appBar: AppBar(title: const Text('Help Desk')),
        body: ListView(
          padding: const EdgeInsets.all(12),
          children: [
            const Text('Frequently Asked Questions',
                style: TextStyle(fontWeight: FontWeight.bold)),
            ...citizen.helpDeskNotes
                .map((n) => ListTile(title: Text(n.title), subtitle: Text(n.content))),
            const SizedBox(height: 12),
            TextField(
              controller: issueCtrl,
              maxLines: 3,
              decoration: const InputDecoration(
                  labelText: 'Submit issue', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 8),
            FilledButton(
              onPressed: token == null
                  ? null
                  : () async {
                      await ApiService()
                          .submitHelpDeskIssue(token: token, question: issueCtrl.text.trim());
                      issueCtrl.clear();
                      await citizenProvider.loadAll(token);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Issue submitted')));
                      }
                    },
              child: const Text('Send to Support'),
            ),
            const SizedBox(height: 14),
            const Text('My Issues', style: TextStyle(fontWeight: FontWeight.bold)),
            ...citizen.myIssues.map(
              (q) => Card(
                child: ListTile(
                  title: Text(q.question),
                  subtitle: Text(q.reply.isEmpty ? 'No reply yet' : q.reply),
                  trailing: Chip(label: Text(q.status)),
                ),
              ),
            ),
          ],
        ),
      );
    }

    final t = AppLocalizations.of(context)!;
    final isAmharic = Localizations.localeOf(context).languageCode == 'am';

    Future<void> refresh() async {
      if (token == null) return;
      await citizenProvider.loadAll(token);
    }

    Future<void> submit() async {
      if (token == null) return;
      final messenger = ScaffoldMessenger.of(context);
      final question = issueCtrl.text.trim();
      if (question.isEmpty) {
        messenger.showSnackBar(
          SnackBar(
            content: Text(
              isAmharic ? 'እባክዎ መጀመሪያ የችግሩን መግለጫ ይጻፉ' : 'Please describe your issue first',
            ),
            backgroundColor: Colors.red.shade700,
          ),
        );
        return;
      }
      setState(() => _submitting = true);
      try {
        await ApiService().submitHelpDeskIssue(token: token, question: question);
        issueCtrl.clear();
        if (!mounted) return;
        messenger.showSnackBar(
          SnackBar(
            content: Text(
              isAmharic ? 'ችግርዎ በተሳካ ሁኔታ ገብቷል' : 'Issue submitted successfully',
            ),
            backgroundColor: const Color(0xFF0B2C4A),
          ),
        );
        await refresh();
      } catch (e) {
        if (!mounted) return;
        messenger.showSnackBar(
          SnackBar(
            content: Text(isAmharic ? 'ማስገባት አልተሳካም: $e' : 'Submission failed: $e'),
            backgroundColor: Colors.red.shade700,
          ),
        );
      } finally {
        if (mounted) setState(() => _submitting = false);
      }
    }

    // Helper for status badge decoration
    Widget buildStatusBadge(String status) {
      Color bgColor;
      Color textColor;
      String label = status.toUpperCase();

      if (status.toLowerCase().contains('pending')) {
        bgColor = const Color(0xFFFEF3C7); // amber-100
        textColor = const Color(0xFFD97706); // amber-600
        label = isAmharic ? 'በጥበቃ ላይ' : 'PENDING';
      } else if (status.toLowerCase().contains('replied') || status.toLowerCase().contains('resolved') || status.toLowerCase().contains('success')) {
        bgColor = const Color(0xFFD1FAE5); // emerald-100
        textColor = const Color(0xFF059669); // emerald-600
        label = isAmharic ? 'ምላሽ የተሰጠው' : 'RESOLVED';
      } else {
        bgColor = const Color(0xFFF3F4F6); // grey-100
        textColor = const Color(0xFF4B5563); // grey-600
      }

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: textColor,
            fontSize: 9,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.2,
          ),
        ),
      );
    }

    return ScreenScaffold(
      title: t.helpDesk,
      actions: const [
        Padding(
          padding: EdgeInsets.only(right: 12.0),
          child: LanguageSelector(),
        ),
      ],
      children: [
        // 1. FAQS ACCORDION SECTION
        Text(
          t.faqs.toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0B2C4A),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        if (citizen.helpDeskNotes.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade300, width: 1.0),
            ),
            child: Text(
              t.noFaqs,
              style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          )
        else
          Theme(
            data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
            child: Column(
              children: citizen.helpDeskNotes.map((n) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey.shade300, width: 1.0),
                  ),
                  child: ExpansionTile(
                    title: Text(
                      TranslationHelper.translate(context, n.title),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    iconColor: const Color(0xFF0B2C4A),
                    collapsedIconColor: Colors.grey.shade500,
                    children: [
                      const Divider(height: 12),
                      const SizedBox(height: 4),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          TranslationHelper.translate(context, n.content),
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade700, height: 1.4),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),

        const SizedBox(height: 24),

        // 2. SUBMIT ISSUE CARD
        Text(
          t.submitIssue.toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0B2C4A),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade300, width: 1.0),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  isAmharic ? 'የችግሩ ዝርዝር መግለጫ' : 'ISSUE DESCRIPTION',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0B2C4A),
                  ),
                ),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: issueCtrl,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: t.issueHint,
                  hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                style: const TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 14),
              FilledButton(
                onPressed: (token == null || _submitting) ? null : submit,
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF0B2C4A),
                  disabledBackgroundColor: Colors.grey.shade300,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  elevation: 0,
                ),
                child: _submitting
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Text(
                        t.sendSupport.toUpperCase(),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                      ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // 3. MY SUPPORT ISSUES LOG
        Text(
          t.myIssues.toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0B2C4A),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        if (citizen.myIssues.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade300, width: 1.0),
            ),
            child: Text(
              t.noIssues,
              style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          )
        else
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade300, width: 1.0),
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: citizen.myIssues.length,
              separatorBuilder: (context, index) => const Divider(height: 1, indent: 16, endIndent: 16),
              itemBuilder: (context, index) {
                final q = citizen.myIssues[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Row(
                              children: [
                                const Icon(Icons.help_outline, size: 16, color: Color(0xFF0B2C4A)),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    TranslationHelper.translate(context, q.question),
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          buildStatusBadge(q.status),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: q.reply.isEmpty ? const Color(0xFFF8FAFC) : const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: q.reply.isEmpty ? const Color(0xFFE2E8F0) : const Color(0xFFDBEAFE),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isAmharic ? 'የድጋፍ ሰጪ ምላሽ፦' : 'OFFICIAL REPLY:',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: q.reply.isEmpty ? const Color(0xFF64748B) : const Color(0xFF1E40AF),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              q.reply.isEmpty ? t.noReply : q.reply,
                              style: TextStyle(
                                fontSize: 11,
                                color: q.reply.isEmpty ? Colors.grey.shade600 : Colors.black87,
                                height: 1.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        const SizedBox(height: 12),
      ],
    );
  }
}
