import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../services/api_service.dart';
import '../l10n/app_localizations.dart';
import '../ui/common/screen_scaffold.dart';
import '../ui/common/language_selector.dart';
import '../utils/platform_utils.dart';
import '../utils/translation_helper.dart';

class AppointmentsScreen extends StatelessWidget {
  const AppointmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final citizen = context.watch<CitizenProvider>();
    final token = context.read<AuthProvider>().token;
    final citizenProvider = context.read<CitizenProvider>();

    // Keep web UI untouched.
    if (PlatformUtils.isWeb) {
      return Scaffold(
        appBar: AppBar(title: const Text('Appointment Services')),
        body: ListView(
          padding: const EdgeInsets.all(12),
          children: [
            FilledButton.icon(
              onPressed: () =>
                  showDialog(context: context, builder: (_) => const _BookAppointmentDialog()),
              icon: const Icon(Icons.add),
              label: const Text('Book Appointment'),
            ),
            const SizedBox(height: 12),
            ...citizen.appointments.map((a) => Card(
                  child: ListTile(
                    title: Text(TranslationHelper.translate(context, a.service?.name ?? 'Service')),
                    subtitle: Text(
                        '${a.date == null ? '-' : DateFormat('yyyy-MM-dd').format(a.date!)} | ${a.timeSlot}'),
                    trailing: Wrap(
                      spacing: 8,
                      children: [
                        Chip(label: Text(a.status)),
                        if ((a.status == 'PENDING' || a.status == 'SCHEDULED') &&
                            token != null)
                          IconButton(
                            onPressed: () async {
                              await ApiService()
                                  .cancelAppointment(token: token, appointmentId: a.id);
                              await citizenProvider.loadAll(token);
                            },
                            icon: const Icon(Icons.cancel_outlined),
                          ),
                      ],
                    ),
                  ),
                )),
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

    // Helper for status badge decoration
    Widget buildStatusBadge(String status) {
      Color bgColor;
      Color textColor;
      String label = status.toUpperCase();

      if (status.toLowerCase().contains('pending')) {
        bgColor = const Color(0xFFFEF3C7); // amber-100
        textColor = const Color(0xFFD97706); // amber-600
        label = isAmharic ? 'በጥበቃ ላይ' : 'PENDING';
      } else if (status.toLowerCase().contains('scheduled') || status.toLowerCase().contains('active')) {
        bgColor = const Color(0xFFD1FAE5); // emerald-100
        textColor = const Color(0xFF059669); // emerald-600
        label = isAmharic ? 'የተያዘ' : 'SCHEDULED';
      } else if (status.toLowerCase().contains('completed') || status.toLowerCase().contains('success') || status.toLowerCase().contains('served')) {
        bgColor = const Color(0xFFE0F2FE); // sky-100
        textColor = const Color(0xFF0284C7); // sky-600
        label = isAmharic ? 'ተጠናቋል' : 'COMPLETED';
      } else if (status.toLowerCase().contains('cancel') || status.toLowerCase().contains('fail')) {
        bgColor = const Color(0xFFFDE8E8); // red-100
        textColor = const Color(0xFFC81E1E); // red-600
        label = isAmharic ? 'የተሰረዘ' : 'CANCELLED';
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
      title: t.appointments,
      actions: const [
        Padding(
          padding: EdgeInsets.only(right: 12.0),
          child: LanguageSelector(),
        ),
      ],
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        // 1. BOOK APPOINTMENT CARD
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
              Text(
                isAmharic 
                    ? 'አዲስ የቀጠሮ ጊዜ ያስይዙ' 
                    : 'BOOK A NEW E-APPOINTMENT',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0B2C4A),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                isAmharic
                    ? 'በመንግስት ዲጂታል አገልግሎት ፖርታል አማካኝነት ቀጥተኛ የቀጠሮ ሰዓት ማስያዝ ይችላሉ።'
                    : 'Schedule an official meeting session directly with administrative offices.',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600, height: 1.3),
              ),
              const SizedBox(height: 14),
              FilledButton.icon(
                onPressed: () => showDialog(
                  context: context,
                  builder: (_) => const _BookAppointmentDialog(),
                ),
                icon: const Icon(Icons.add, size: 16),
                label: Text(
                  t.bookAppointment.toUpperCase(),
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF0B2C4A),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  elevation: 0,
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // 2. APPOINTMENTS SCHEDULE LOG
        Text(
          (isAmharic ? 'የቀጠሮ መዝገብ ታሪክ' : 'OFFICIAL APPOINTMENTS SCHEDULE').toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0B2C4A),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        if (citizen.appointments.isEmpty && !citizen.isLoading)
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade300, width: 1.0),
            ),
            child: Column(
              children: [
                Icon(Icons.calendar_month_outlined, color: Colors.grey.shade400, size: 36),
                const SizedBox(height: 10),
                Text(
                  isAmharic ? 'ምንም ቀጠሮ አልተያዘም' : 'No appointments scheduled yet.',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)),
                ),
              ],
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
              itemCount: citizen.appointments.length,
              separatorBuilder: (context, index) => const Divider(height: 1, indent: 16, endIndent: 16),
              itemBuilder: (context, index) {
                final a = citizen.appointments[index];
                final formattedDate = a.date == null ? '-' : DateFormat('yyyy-MM-dd').format(a.date!);
                final isCancellable = (a.status == 'PENDING' || a.status == 'SCHEDULED') && token != null;

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0B2C4A).withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Icon(
                          Icons.calendar_today_outlined,
                          color: Color(0xFF0B2C4A),
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              TranslationHelper.translate(context, a.service?.name ?? 'Service'),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '$formattedDate • ${a.timeSlot}',
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade600, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          buildStatusBadge(a.status),
                          if (isCancellable) ...[
                            const SizedBox(height: 4),
                            InkWell(
                              onTap: () async {
                                await ApiService().cancelAppointment(token: token, appointmentId: a.id);
                                await refresh();
                              },
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                child: Text(
                                  t.cancel.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.red.shade700,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
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

class _BookAppointmentDialog extends StatefulWidget {
  const _BookAppointmentDialog();

  @override
  State<_BookAppointmentDialog> createState() => _BookAppointmentDialogState();
}

class _BookAppointmentDialogState extends State<_BookAppointmentDialog> {
  String? serviceId;
  String? date; // yyyy-MM-dd
  String? slot;
  bool loading = false;
  String? error;
  List<String> availableSlots = const [];
  bool slotsLoading = false;
  String? slotsError;
  int _slotFetchNonce = 0;

  final _dateCtrl = TextEditingController();

  @override
  void dispose() {
    _dateCtrl.dispose();
    super.dispose();
  }

  bool get _canFetchSlots {
    if (serviceId == null) return false;
    if (date == null) return false;
    if (date!.trim().length != 10) return false; // yyyy-MM-dd
    return DateTime.tryParse(date!) != null;
  }

  Future<void> _refreshSlots({required String token}) async {
    if (!_canFetchSlots) return;
    setState(() {
      slotsLoading = true;
      slotsError = null;
      availableSlots = const [];
      slot = null;
    });

    final nonce = ++_slotFetchNonce;
    try {
      final slots = await ApiService().getAvailableAppointmentSlots(
        token: token,
        serviceId: serviceId!,
        date: date!,
      );
      if (!mounted || nonce != _slotFetchNonce) return;
      setState(() {
        availableSlots = slots;
        slotsError = slots.isEmpty ? 'No slots available for the selected date.' : null;
      });
    } catch (e) {
      if (!mounted || nonce != _slotFetchNonce) return;
      setState(() => slotsError = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted && nonce == _slotFetchNonce) {
        setState(() => slotsLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final citizen = context.watch<CitizenProvider>();
    final token = context.read<AuthProvider>().token;
    final citizenProvider = context.read<CitizenProvider>();
    final isAmharic = Localizations.localeOf(context).languageCode == 'am';

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      contentPadding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.add_task_outlined, size: 20, color: Color(0xFF0B2C4A)),
              const SizedBox(width: 8),
              Text(
                isAmharic ? 'ቀጠሮ ያስይዙ' : 'Book Appointment',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0B2C4A)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Divider(height: 1),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. SELECT SERVICE LABEL & DROPDOWN
            Text(
              (isAmharic ? 'አገልግሎት ይምረጡ' : 'SELECT SERVICE').toUpperCase(),
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0B2C4A)),
            ),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              initialValue: serviceId,
              hint: Text(isAmharic ? 'እባክዎ ይምረጡ' : 'Select service', style: const TextStyle(fontSize: 13)),
              items: citizen.appointmentServices.map((s) => DropdownMenuItem(value: s.id, child: Text(TranslationHelper.translate(context, s.name), style: const TextStyle(fontSize: 12)))).toList(),
              decoration: const InputDecoration(
                contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              ),
              onChanged: (v) async {
                setState(() {
                  serviceId = v;
                  availableSlots = const [];
                  error = null;
                  slotsError = null;
                });
                if (token == null || v == null) return;
                await _refreshSlots(token: token);
              },
            ),
            const SizedBox(height: 14),

            // 2. APPOINTMENT DATE LABEL & INPUT
            Text(
              (isAmharic ? 'ቀን ይምረጡ' : 'APPOINTMENT DATE').toUpperCase(),
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0B2C4A)),
            ),
            const SizedBox(height: 6),
            TextFormField(
              controller: _dateCtrl,
              readOnly: true,
              decoration: InputDecoration(
                hintText: 'YYYY-MM-DD',
                hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                suffixIcon: const Icon(Icons.calendar_month_outlined, size: 20),
                contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              ),
              style: const TextStyle(fontSize: 13),
              onTap: token == null
                  ? null
                  : () async {
                      final now = DateTime.now();
                      final picked = await showDatePicker(
                        context: context,
                        firstDate: DateTime(now.year, now.month, now.day),
                        lastDate: DateTime(now.year + 1, 12, 31),
                        initialDate: DateTime(now.year, now.month, now.day),
                      );
                      if (picked == null) return;
                      final formatted = DateFormat('yyyy-MM-dd').format(picked);
                      setState(() {
                        date = formatted;
                        _dateCtrl.text = formatted;
                        availableSlots = const [];
                        slotsError = null;
                        error = null;
                      });
                      await _refreshSlots(token: token);
                    },
            ),
            const SizedBox(height: 14),

            // 3. AVAILABLE TIME SLOTS LABEL & CHIPS
            Text(
              (isAmharic ? 'የቀን ሰዓት ይምረጡ' : 'AVAILABLE TIME SLOTS').toUpperCase(),
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0B2C4A)),
            ),
            const SizedBox(height: 8),

            if (slotsLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 12.0),
                child: LinearProgressIndicator(minHeight: 2),
              ),

            if (!slotsLoading && slotsError != null)
              Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFFDE8E8),
                  border: Border.all(color: const Color(0xFFF8B4B4)),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Column(
                  children: [
                    Text(slotsError!, style: const TextStyle(color: Color(0xFFC81E1E), fontSize: 11)),
                    const SizedBox(height: 4),
                    OutlinedButton.icon(
                      onPressed: token == null ? null : () => _refreshSlots(token: token),
                      icon: const Icon(Icons.refresh, size: 12),
                      label: Text(isAmharic ? 'እንደገና ሙክር' : 'RETRY', style: const TextStyle(fontSize: 10)),
                      style: OutlinedButton.styleFrom(
                        minimumSize: Size.zero,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      ),
                    ),
                  ],
                ),
              ),

            if (!slotsLoading && availableSlots.isEmpty && slotsError == null)
              Padding(
                padding: const EdgeInsets.only(top: 4, bottom: 8),
                child: Text(
                  isAmharic 
                      ? 'እባክዎ መጀመሪያ አገልግሎት እና ቀን ይምረጡ።' 
                      : 'Pick a service and date to search available slots.',
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade500, fontStyle: FontStyle.italic),
                ),
              ),

            if (availableSlots.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final s in availableSlots)
                      ChoiceChip(
                        label: Text(s, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: slot == s ? Colors.white : Colors.black87)),
                        selected: slot == s,
                        selectedColor: const Color(0xFF0B2C4A),
                        backgroundColor: Colors.grey.shade100,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                          side: BorderSide(color: slot == s ? const Color(0xFF0B2C4A) : Colors.grey.shade300),
                        ),
                        elevation: 0,
                        pressElevation: 0,
                        onSelected: (selected) => setState(() => slot = selected ? s : null),
                      ),
                  ],
                ),
              ),

            if (error != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(error!, style: const TextStyle(color: Colors.red, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
          ],
        ),
      ),
      actions: [
        OutlinedButton(
          onPressed: () => Navigator.pop(context),
          style: OutlinedButton.styleFrom(
            foregroundColor: Colors.grey.shade700,
            side: BorderSide(color: Colors.grey.shade300),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
          ),
          child: Text(isAmharic ? 'ሰርዝ' : 'Cancel'),
        ),
        FilledButton(
          onPressed: loading || token == null
              ? null
              : () async {
                  if (serviceId == null || date == null || slot == null) {
                    setState(() => error = isAmharic ? 'እባክዎ አገልግሎት፣ ቀን እና ሰዓት ይምረጡ' : 'Please select service, date, and time slot.');
                    return;
                  }
                  setState(() {
                    loading = true;
                    error = null;
                  });
                  try {
                    await ApiService().bookAppointment(token: token, serviceId: serviceId!, date: date!, timeSlot: slot!);
                    await citizenProvider.loadAll(token);
                    if (context.mounted) Navigator.pop(context);
                  } catch (e) {
                    setState(() => error = e.toString().replaceFirst('Exception: ', ''));
                  } finally {
                    setState(() => loading = false);
                  }
                },
          style: FilledButton.styleFrom(
            backgroundColor: const Color(0xFF0B2C4A),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
            elevation: 0,
          ),
          child: Text(loading ? (isAmharic ? 'በመያዝ ላይ...' : 'Booking...') : (isAmharic ? 'አረጋግጥ' : 'Confirm')),
        ),
      ],
    );
  }
}
