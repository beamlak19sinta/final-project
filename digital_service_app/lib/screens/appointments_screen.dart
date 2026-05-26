import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../models/appointment_item.dart';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../services/api_service.dart';
import 'package:digital_service_app/l10n/app_localizations.dart';
import '../l10n/service_translations.dart';
import '../widgets/app_card.dart';
import '../widgets/app_button.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  bool _isLoading = false;

  void _showFeedback(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Theme.of(context).colorScheme.error : null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final citizen = context.watch<CitizenProvider>();
    final token = context.read<AuthProvider>().token;
    final citizenProvider = context.read<CitizenProvider>();
    final api = context.read<ApiService>();
    final theme = Theme.of(context);
    final t = AppLocalizations.of(context)!;

    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(AppTheme.lg),
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            t.yourAppointments,
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.w900,
                              fontSize: 28,
                              letterSpacing: -0.2,
                            ),
                          ),
                          const SizedBox(height: AppTheme.xs),
                          Text(
                            t.scheduleYourVisit,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppTheme.lg),
                    AppButton(
                      label: t.bookAppointment,
                      icon: Icons.add,
                      expand: false,
                      onPressed: () => showDialog(
                        context: context,
                        builder: (_) => const _BookAppointmentDialog(),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppTheme.xxl),
                if (citizen.appointments.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(AppTheme.xxxl),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surfaceContainerLow.withValues(
                        alpha: 0.25,
                      ),
                      borderRadius: BorderRadius.circular(40),
                      border: Border.all(
                        color: theme.colorScheme.outline,
                        width: 2,
                      ),
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surfaceContainerHighest,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.calendar_month_outlined,
                            color: theme.colorScheme.onSurfaceVariant,
                            size: 36,
                          ),
                        ),
                        const SizedBox(height: AppTheme.xl),
                        Text(
                          t.noAppointmentsYet,
                          textAlign: TextAlign.center,
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w900,
                            fontSize: 22,
                          ),
                        ),
                        const SizedBox(height: AppTheme.sm),
                        Text(
                          t.bookFirstAppointment,
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: AppTheme.xl),
                        AppButton(
                          label: t.bookAppointment,
                          icon: Icons.add,
                          variant: AppButtonVariant.outlined,
                          expand: false,
                          onPressed: () => showDialog(
                            context: context,
                            builder: (_) => const _BookAppointmentDialog(),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  ...citizen.appointments.map(
                    (a) => _AppointmentCard(
                      appointment: a,
                      onCancel: token != null
                          ? () async {
                              setState(() => _isLoading = true);
                              try {
                                await api.cancelAppointment(
                                  token: token,
                                  appointmentId: a.id,
                                );
                                await citizenProvider.loadAll(token);
                                _showFeedback(t.appointmentCancelled);
                              } catch (e) {
                                _showFeedback(
                                  e.toString(),
                                  isError: true,
                                );
                              } finally {
                                if (mounted) {
                                  setState(() => _isLoading = false);
                                }
                              }
                            }
                          : null,
                    ),
                  ),
              ],
            ),
    );
  }
}

/// Modern appointment card widget
class _AppointmentCard extends StatelessWidget {
  const _AppointmentCard({required this.appointment, this.onCancel});

  final AppointmentItem appointment;
  final VoidCallback? onCancel;

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING':
        return AppColors.statusPending;
      case 'SCHEDULED':
        return AppColors.statusScheduled;
      case 'COMPLETED':
        return AppColors.statusCompleted;
      case 'CANCELLED':
        return AppColors.statusCancelled;
      case 'REJECTED':
        return AppColors.statusRejected;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final t = AppLocalizations.of(context)!;
    final statusColor = _getStatusColor(appointment.status);

    final canCancel =
        onCancel != null &&
        (appointment.status == 'PENDING' || appointment.status == 'SCHEDULED');

    return AppCard(
      margin: const EdgeInsets.only(bottom: AppTheme.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                child: Icon(
                  Icons.calendar_month,
                  color: theme.colorScheme.primary,
                  size: 28,
                ),
              ),
              const SizedBox(width: AppTheme.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ServiceTranslations.translate(context, appointment.service?.name),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(height: AppTheme.sm),
                    Wrap(
                      spacing: AppTheme.lg,
                      runSpacing: AppTheme.sm,
                      children: [
                        _InfoItem(
                          icon: Icons.calendar_today_outlined,
                          text: appointment.date == null
                              ? '-'
                              : DateFormat('MMM dd, yyyy')
                                  .format(appointment.date!),
                        ),
                        _InfoItem(icon: Icons.schedule, text: appointment.timeSlot),
                        _InfoItem(
                          icon: Icons.apartment_outlined,
                          text: ServiceTranslations.translate(context, appointment.service?.sectorName),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppTheme.md),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppTheme.md,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  ServiceTranslations.translate(context, appointment.status).toUpperCase(),
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    fontStyle: FontStyle.italic,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            ],
          ),

          // Cancel button (if applicable)
          if (canCancel) ...[
            const SizedBox(height: AppTheme.lg),
            Divider(color: theme.colorScheme.outline),
            const SizedBox(height: AppTheme.lg),
            SizedBox(
              width: double.infinity,
              child: AppButton(
                label: t.cancelAppointment,
                icon: Icons.close,
                variant: AppButtonVariant.outlined,
                destructive: true,
                size: AppButtonSize.small,
                onPressed: onCancel,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  const _InfoItem({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (text.trim().isEmpty) return const SizedBox.shrink();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: theme.colorScheme.primary),
        const SizedBox(width: AppTheme.xs),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 220),
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
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
    final t = AppLocalizations.of(context)!;
    setState(() {
      slotsLoading = true;
      slotsError = null;
      availableSlots = const [];
      slot = null;
    });

    final nonce = ++_slotFetchNonce;
    try {
      final slots = await context
          .read<ApiService>()
          .getAvailableAppointmentSlots(
            token: token,
            serviceId: serviceId!,
            date: date!,
          );
      if (!mounted || nonce != _slotFetchNonce) return;
      setState(() {
        availableSlots = slots;
        slotsError = slots.isEmpty ? t.noSlotsAvailableForDate : null;
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
    final t = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
      title: Text(
        t.bookAppointmentTitle,
        style: theme.textTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.w900,
          fontSize: 22,
        ),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          DropdownButtonFormField<String>(
            // ignore: deprecated_member_use
            value: serviceId,
            isExpanded: true,
            hint: Text(t.selectService),
            items: citizen.appointmentServices
                .map((s) => DropdownMenuItem(
                      value: s.id,
                      child: Text(
                        ServiceTranslations.translate(context, s.name),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ))
                .toList(),
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
          const SizedBox(height: 10),
          TextFormField(
            controller: _dateCtrl,
            readOnly: true,
            decoration: InputDecoration(
              labelText: t.date,
              hintText: t.dateHint,
              suffixIcon: const Icon(Icons.calendar_month_outlined),
            ),
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
          const SizedBox(height: 10),
          if (slotsLoading) const LinearProgressIndicator(),
          if (!slotsLoading && slotsError != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(slotsError!, style: const TextStyle(color: Colors.red)),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: token == null
                        ? null
                        : () => _refreshSlots(token: token),
                    icon: const Icon(Icons.refresh),
                    label: Text(t.retry),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerLeft,
            child: Text(
              t.availableTimeSlots,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(height: 8),
          if (!slotsLoading && availableSlots.isEmpty && slotsError == null)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(t.pickServiceAndDate),
            ),
          if (availableSlots.isNotEmpty)
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final s in availableSlots)
                  ChoiceChip(
                    label: Text(s),
                    selected: slot == s,
                    labelStyle: TextStyle(
                      fontWeight: FontWeight.w800,
                      color: slot == s
                          ? theme.colorScheme.primary
                          : theme.colorScheme.onSurface,
                    ),
                    selectedColor:
                        theme.colorScheme.primary.withValues(alpha: 0.1),
                    side: BorderSide(color: theme.colorScheme.outline),
                    onSelected: (selected) =>
                        setState(() => slot = selected ? s : null),
                  ),
              ],
            ),
          if (error != null)
            Text(error!, style: const TextStyle(color: Colors.red)),
        ],
      ),
      contentPadding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(t.cancel),
        ),
        FilledButton(
          onPressed: loading || token == null
              ? null
              : () async {
                  if (serviceId == null || date == null || slot == null) {
                    setState(() => error = t.pleaseSelectAllFields);
                    return;
                  }
                  setState(() {
                    loading = true;
                    error = null;
                  });
                  try {
                    await context.read<ApiService>().bookAppointment(
                      token: token,
                      serviceId: serviceId!,
                      date: date!,
                      timeSlot: slot!,
                    );
                    await citizenProvider.loadAll(token);
                    if (context.mounted) Navigator.pop(context);
                  } catch (e) {
                    if (mounted) {
                      setState(
                        () => error = e.toString().replaceFirst(
                          'Exception: ',
                          '',
                        ),
                      );
                    }
                  } finally {
                    if (mounted) {
                      setState(() => loading = false);
                    }
                  }
                },
          child: Text(loading ? t.booking : t.confirm),
        ),
      ],
    );
  }
}
