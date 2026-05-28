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

class OnlineServicesScreen extends StatefulWidget {
  const OnlineServicesScreen({super.key});

  @override
  State<OnlineServicesScreen> createState() => _OnlineServicesScreenState();
}

class _OnlineServicesScreenState extends State<OnlineServicesScreen> {
  final _remarks = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _remarks.dispose();
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
        appBar: AppBar(title: const Text('Online Services')),
        body: ListView(
          padding: const EdgeInsets.all(12),
          children: [
            ...citizen.onlineServices.map(
              (s) => Card(
                child: ListTile(
                  title: Text(s.name),
                  subtitle: Text(s.description),
                  trailing: FilledButton(
                    onPressed: token == null
                        ? null
                        : () async {
                            await ApiService().submitOnlineRequest(
                              token: token,
                              serviceId: s.id,
                              remarks: _remarks.text.trim(),
                            );
                            await citizenProvider.loadAll(token);
                          },
                    child: const Text('Request'),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _remarks,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Remarks for online request',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            const Text('My Request History'),
            ...citizen.onlineRequests.map((r) => ListTile(
                title: Text(r.service?.name ?? ''),
                subtitle: Text(r.remarks),
                trailing: Chip(label: Text(r.status)))),
          ],
        ),
      );
    }

    final t = AppLocalizations.of(context)!;
    final isAmharic = Localizations.localeOf(context).languageCode == 'am';
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    Future<void> refresh() async {
      if (token == null) return;
      await citizenProvider.loadAll(token);
    }

    Future<void> submitRequest(String serviceId) async {
      if (token == null) return;
      final messenger = ScaffoldMessenger.of(context);
      setState(() => _submitting = true);
      try {
        await ApiService().submitOnlineRequest(
          token: token,
          serviceId: serviceId,
          remarks: _remarks.text.trim(),
        );
        if (!mounted) return;
        messenger.showSnackBar(
          SnackBar(
            content: Text(
              isAmharic
                  ? 'የኦንላይን ማመልከቻዎ በተሳካ ሁኔታ ገብቷል'
                  : 'Your online request has been successfully submitted',
            ),
            backgroundColor: colorScheme.primary,
          ),
        );
        _remarks.clear();
        await refresh();
      } catch (e) {
        if (!mounted) return;
        messenger.showSnackBar(
          SnackBar(
            content: Text(
              isAmharic
                  ? 'ማመልከቻው አልተሳካም: $e'
                  : 'Submission failed: $e',
            ),
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
      } else if (status.toLowerCase().contains('processing') || status.toLowerCase().contains('approved')) {
        bgColor = const Color(0xFFD1FAE5); // emerald-100
        textColor = const Color(0xFF059669); // emerald-600
        label = isAmharic ? 'በሂደት ላይ' : 'APPROVED';
      } else if (status.toLowerCase().contains('completed') || status.toLowerCase().contains('success')) {
        bgColor = const Color(0xFFE0F2FE); // sky-100
        textColor = const Color(0xFF0284C7); // sky-600
        label = isAmharic ? 'ተጠናቋል' : 'COMPLETED';
      } else if (status.toLowerCase().contains('rejected') || status.toLowerCase().contains('failed')) {
        bgColor = const Color(0xFFFDE8E8); // red-100
        textColor = const Color(0xFFC81E1E); // red-600
        label = isAmharic ? 'ውድቅ የተደረገ' : 'REJECTED';
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
            fontSize: 10,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.2,
          ),
        ),
      );
    }

    return ScreenScaffold(
      title: t.onlineServices,
      actions: const [
        Padding(
          padding: EdgeInsets.only(right: 12.0),
          child: LanguageSelector(),
        ),
      ],
      children: [
        // 1. REQUEST PARAMETERS CARD
        Text(
          (isAmharic ? 'የማመልከቻ ዝርዝሮች' : 'REQUEST PARAMETERS').toUpperCase(),
          style: theme.textTheme.labelMedium?.copyWith(
            color: colorScheme.onSurface.withValues(alpha: 0.80),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: colorScheme.outline, width: 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                t.remarks,
                style: theme.textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _remarks,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: t.remarksHint,
                  hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                style: const TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                isAmharic 
                    ? '* ማሳሰቢያ፦ እባክዎ ከታች ካሉት ዝርዝሮች ውስጥ አንዱን አገልግሎት ከመምረጥዎ በፊት ከላይ ያለውን ማስታወሻ መጻፍዎን ያረጋግጡ።'
                    : '* Note: Please write any remarks above BEFORE selecting a service to submit below.',
                style: TextStyle(fontSize: 9, color: Colors.grey.shade500, fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // 2. AVAILABLE SERVICES LIST
        Text(
          t.availableServices.toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0B2C4A),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        if (citizen.onlineServices.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade300, width: 1.0),
            ),
            child: Text(
              t.noOnlineServices,
              style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: citizen.onlineServices.length,
            itemBuilder: (context, index) {
              final s = citizen.onlineServices[index];
              final serviceIcon = TranslationHelper.getServiceIcon(s.name);
              final localizedTitle = TranslationHelper.translate(context, s.name);
              final localizedDesc = TranslationHelper.translate(context, s.description);

              return Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                  side: BorderSide(color: Colors.grey.shade300, width: 1.0),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0B2C4A).withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Icon(
                          serviceIcon,
                          color: const Color(0xFF0B2C4A),
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              localizedTitle,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: Color(0xFF1E293B),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              localizedDesc,
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey.shade600,
                                height: 1.3,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Align(
                              alignment: Alignment.centerLeft,
                              child: FilledButton(
                                onPressed: (token == null || _submitting)
                                    ? null
                                    : () => submitRequest(s.id),
                                style: FilledButton.styleFrom(
                                  backgroundColor: const Color(0xFF0B2C4A),
                                  disabledBackgroundColor: Colors.grey.shade300,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  elevation: 0,
                                ),
                                child: _submitting
                                    ? const SizedBox(
                                        width: 14,
                                        height: 14,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : Text(
                                        t.submit.toUpperCase(),
                                        style: const TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

        const SizedBox(height: 24),

        // 3. MY REQUEST HISTORY
        Text(
          t.myRequestHistory.toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0B2C4A),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        if (citizen.onlineRequests.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade300, width: 1.0),
            ),
            child: Text(
              t.noRequestsYet,
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
              itemCount: citizen.onlineRequests.length,
              separatorBuilder: (context, index) => const Divider(height: 1, indent: 16, endIndent: 16),
              itemBuilder: (context, index) {
                final r = citizen.onlineRequests[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              TranslationHelper.translate(context, r.service?.name ?? '-'),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          buildStatusBadge(r.status),
                        ],
                      ),
                      if (r.remarks.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Text(
                            r.remarks,
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade700, height: 1.3),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}
