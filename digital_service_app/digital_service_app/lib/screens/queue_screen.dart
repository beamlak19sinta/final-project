import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../services/api_service.dart';
import '../l10n/app_localizations.dart';
import '../ui/common/screen_scaffold.dart';
import '../ui/common/language_selector.dart';
import '../utils/platform_utils.dart';
import '../utils/translation_helper.dart';

class QueueScreen extends StatelessWidget {
  const QueueScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final citizen = context.watch<CitizenProvider>();
    final token = context.read<AuthProvider>().token;
    final citizenProvider = context.read<CitizenProvider>();

    // Keep web UI untouched.
    if (PlatformUtils.isWeb) {
      return Scaffold(
        appBar: AppBar(title: const Text('Queue Services')),
        body: ListView(
          padding: const EdgeInsets.all(12),
          children: [
            if (citizen.activeQueue != null)
              Card(
                child: ListTile(
                  title: Text(
                      'Ticket #${citizen.activeQueue!.ticketNumber} - ${citizen.activeQueue!.service?.name ?? ''}'),
                  subtitle: Text(
                      'Status: ${citizen.activeQueue!.status} | Ahead: ${citizen.activeQueue!.peopleAhead}'),
                  trailing: token == null
                      ? null
                      : IconButton(
                          onPressed: () async {
                            await ApiService().cancelQueueTicket(
                                token: token, queueId: citizen.activeQueue!.id);
                            await citizenProvider.loadAll(token);
                          },
                          icon: const Icon(Icons.close),
                        ),
                ),
              ),
            const SizedBox(height: 8),
            const Text('Join Queue'),
            ...citizen.queueServices.map(
              (s) => Card(
                child: ListTile(
                  title: Text(s.name),
                  subtitle: Text(s.sectorName ?? ''),
                  trailing: FilledButton(
                    onPressed: token == null
                        ? null
                        : () async {
                            await ApiService().joinQueue(token: token, serviceId: s.id);
                            await citizenProvider.loadAll(token);
                          },
                    child: const Text('Join'),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            const Text('Queue History'),
            ...citizen.queueHistory.map((q) => ListTile(
                title: Text('${q.service?.name ?? ''} #${q.ticketNumber}'),
                trailing: Chip(label: Text(q.status)))),
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

    // Helper method for badge decoration
    Widget buildStatusBadge(String status) {
      Color bgColor;
      Color textColor;
      String label = status.toUpperCase();

      if (status.toLowerCase().contains('pending')) {
        bgColor = const Color(0xFFFEF3C7); // amber-100
        textColor = const Color(0xFFD97706); // amber-600
        label = isAmharic ? 'በጥበቃ ላይ' : 'PENDING';
      } else if (status.toLowerCase().contains('processing') || status.toLowerCase().contains('active')) {
        bgColor = const Color(0xFFD1FAE5); // emerald-100
        textColor = const Color(0xFF059669); // emerald-600
        label = isAmharic ? 'በሂደት ላይ' : 'ACTIVE';
      } else if (status.toLowerCase().contains('completed') || status.toLowerCase().contains('served')) {
        bgColor = const Color(0xFFE0F2FE); // sky-100
        textColor = const Color(0xFF0284C7); // sky-600
        label = isAmharic ? 'ተጠናቋል' : 'SERVED';
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
      title: t.queue,
      actions: const [
        Padding(
          padding: EdgeInsets.only(right: 12.0),
          child: LanguageSelector(),
        ),
      ],
      children: [
        // 1. ACTIVE TICKET STUB
        Text(
          (isAmharic ? 'ንቁ ወረፋ ቲኬት' : 'ACTIVE QUEUE TICKET').toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0B2C4A),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        if (citizen.activeQueue != null)
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFCA8A04), width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  color: const Color(0xFFFEF08A), // Light amber header
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.confirmation_number_outlined, size: 16, color: Color(0xFF854D0E)),
                          const SizedBox(width: 6),
                          Text(
                            isAmharic ? 'የአሁኑ የሰልፍ ሁኔታ' : 'CURRENT QUEUE STATUS',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF854D0E),
                            ),
                          ),
                        ],
                      ),
                      buildStatusBadge(citizen.activeQueue!.status),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isAmharic ? 'የቲኬት ቁጥር' : 'TICKET NUMBER',
                                style: TextStyle(fontSize: 9, color: Colors.grey.shade500, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '#${citizen.activeQueue!.ticketNumber}',
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0B2C4A)),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                isAmharic ? 'የሚጠብቁ ሰዎች' : 'PEOPLE AHEAD',
                                style: TextStyle(fontSize: 9, color: Colors.grey.shade500, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${citizen.activeQueue!.peopleAhead}',
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFFCA8A04)),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Divider(height: 1),
                      const SizedBox(height: 12),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isAmharic ? 'አገልግሎት ክፍል' : 'SERVICE POINT / SECTOR',
                                  style: TextStyle(fontSize: 9, color: Colors.grey.shade500, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  TranslationHelper.translate(context, citizen.activeQueue!.service?.name ?? '-'),
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (citizen.activeQueue!.service?.sectorName != null) ...[
                                  const SizedBox(height: 2),
                                  Text(
                                    TranslationHelper.translate(context, citizen.activeQueue!.service!.sectorName!),
                                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.cancel_outlined, size: 16),
                          label: Text(
                            isAmharic ? 'ቲኬት ሰርዝ' : 'CANCEL TICKET',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                          ),
                          onPressed: token == null
                              ? null
                              : () async {
                                  await ApiService().cancelQueueTicket(
                                      token: token, queueId: citizen.activeQueue!.id);
                                  await refresh();
                                },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.red.shade700,
                            side: BorderSide(color: Colors.red.shade200, width: 1.0),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          )
        else
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade300, width: 1.0),
            ),
            child: Column(
              children: [
                Icon(Icons.info_outline, color: Colors.grey.shade400, size: 36),
                const SizedBox(height: 10),
                Text(
                  t.noActiveQueue,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1E293B)),
                ),
                const SizedBox(height: 4),
                Text(
                  t.joinQueueBelow,
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),

        const SizedBox(height: 24),

        // 2. JOIN QUEUE SECTION
        Text(
          (isAmharic ? 'አገልግሎት ወረፋ ይቀላቀሉ' : 'JOIN DEPARTMENT QUEUE').toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0B2C4A),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        if (citizen.queueServices.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade300, width: 1.0),
            ),
            child: Text(
              t.noQueueServices,
              style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: citizen.queueServices.length,
            itemBuilder: (context, index) {
              final s = citizen.queueServices[index];
              final serviceIcon = TranslationHelper.getServiceIcon(s.name);
              final localizedTitle = TranslationHelper.translate(context, s.name);
              final localizedSector = s.sectorName != null 
                  ? TranslationHelper.translate(context, s.sectorName!) 
                  : (isAmharic ? 'አጠቃላይ ክፍል' : 'General Department');

              return Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                  side: BorderSide(color: Colors.grey.shade300, width: 1.0),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0B2C4A).withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Icon(
                          serviceIcon,
                          color: const Color(0xFF0B2C4A),
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              localizedTitle,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              localizedSector,
                              style: TextStyle(fontSize: 10, color: Colors.grey.shade500),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      FilledButton(
                        onPressed: token == null || citizen.activeQueue != null
                            ? null
                            : () async {
                                await ApiService().joinQueue(token: token, serviceId: s.id);
                                await refresh();
                              },
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF0B2C4A),
                          disabledBackgroundColor: Colors.grey.shade300,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          elevation: 0,
                        ),
                        child: Text(
                          t.takeTicket.toUpperCase(),
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

        const SizedBox(height: 24),

        // 3. QUEUE LOG HISTORY TABLE
        Text(
          (isAmharic ? 'የሰልፍ መዝገብ ታሪክ' : 'OFFICIAL QUEUE LOG HISTORY').toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0B2C4A),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        if (citizen.queueHistory.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade300, width: 1.0),
            ),
            child: Text(
              t.noQueueHistory,
              style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: citizen.queueHistory.length,
            itemBuilder: (context, index) {
              final q = citizen.queueHistory[index];
              final serviceIcon = TranslationHelper.getServiceIcon(q.service?.name ?? '');
              final localizedTitle = TranslationHelper.translate(context, q.service?.name ?? '-');
              final localizedSector = q.service?.sectorName != null 
                  ? TranslationHelper.translate(context, q.service!.sectorName!) 
                  : null;
              final dateStr = q.createdAt != null 
                  ? DateFormat('yyyy-MM-dd HH:mm').format(q.createdAt!.toLocal()) 
                  : '-';

              return Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                  side: BorderSide(color: Colors.grey.shade300, width: 1.0),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0B2C4A).withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Icon(
                      serviceIcon,
                      color: const Color(0xFF0B2C4A),
                      size: 20,
                    ),
                  ),
                  title: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          localizedTitle,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '#${q.ticketNumber}',
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                          color: Color(0xFF0B2C4A),
                        ),
                      ),
                    ],
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (localizedSector != null)
                                Text(
                                  localizedSector,
                                  style: TextStyle(fontSize: 10, color: Colors.grey.shade500),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              Text(
                                dateStr,
                                style: TextStyle(fontSize: 9, color: Colors.grey.shade400),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        buildStatusBadge(q.status),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
      ],
    );
  }
}
