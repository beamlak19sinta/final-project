import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../services/api_service.dart';
import 'package:digital_service_app/l10n/app_localizations.dart';
import '../l10n/service_translations.dart';
import '../widgets/app_button.dart';
import '../widgets/app_card.dart';

class OnlineServicesScreen extends StatefulWidget {
  const OnlineServicesScreen({super.key});

  @override
  State<OnlineServicesScreen> createState() => _OnlineServicesScreenState();
}

class _OnlineServicesScreenState extends State<OnlineServicesScreen> {
  Color _statusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return AppColors.statusPending;
      case 'PROCESSING':
      case 'ACTIVE':
      case 'CALLING':
        return AppColors.statusScheduled;
      case 'COMPLETED':
        return AppColors.statusCompleted;
      case 'CANCELLED':
      case 'REJECTED':
        return AppColors.statusCancelled;
      default:
        return Colors.grey;
    }
  }

  Widget _statusBadge(BuildContext context, String status) {
    final color = _statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.md, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w800,
          fontStyle: FontStyle.italic,
          letterSpacing: 0.3,
        ),
      ),
    );
  }

  void _showFeedback(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Theme.of(context).colorScheme.error : null,
      ),
    );
  }

  Future<void> _showSubmitDialog(
    BuildContext context,
    String token,
    String serviceId,
    String serviceName,
  ) async {
    final remarksController = TextEditingController();
    bool isSubmitting = false;
    final api = context.read<ApiService>();
    final t = AppLocalizations.of(context)!;

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(32),
            ),
            title: Text(
              t.requestService(ServiceTranslations.translate(context, serviceName)),
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w900,
                    fontSize: 22,
                  ),
            ),
            content: Padding(
              padding: const EdgeInsets.only(top: AppTheme.sm),
              child: TextField(
                controller: remarksController,
                minLines: 4,
                maxLines: 6,
                decoration: InputDecoration(
                  labelText: t.remarks,
                  hintText: t.remarksHint,
                  alignLabelWithHint: true,
                ),
              ),
            ),
            contentPadding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
            actions: [
              TextButton(
                onPressed: isSubmitting ? null : () => Navigator.pop(ctx),
                child: Text(t.cancel),
              ),
              FilledButton(
                onPressed: isSubmitting
                    ? null
                    : () async {
                        if (remarksController.text.trim().isEmpty) {
                          _showFeedback(t.pleaseEnterRemarks, isError: true);
                          return;
                        }
                        setDialogState(() => isSubmitting = true);
                        try {
                          await api.submitOnlineRequest(
                            token: token,
                            serviceId: serviceId,
                            remarks: remarksController.text.trim(),
                          );
                          if (!context.mounted) return;
                          await context.read<CitizenProvider>().loadAll(token);
                          if (ctx.mounted) Navigator.pop(ctx);
                          _showFeedback(t.requestSubmittedSuccessfully);
                        } catch (e) {
                          _showFeedback(e.toString(), isError: true);
                          setDialogState(() => isSubmitting = false);
                        }
                      },
                child: isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(
                        t.submit,
                        style: const TextStyle(fontWeight: FontWeight.w900),
                      ),
              ),
            ],
          );
        },
      ),
    );
    remarksController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final citizen = context.watch<CitizenProvider>();
    final token = context.read<AuthProvider>().token;
    final theme = Theme.of(context);
    final t = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(t.onlineServices)),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.lg),
        children: [
          AppSectionHeader(t.availableServices),
          const SizedBox(height: AppTheme.md),
          if (citizen.onlineServices.isEmpty)
            const EmptyStateWidget(
              icon: Icons.public_outlined,
              title: 'No services available',
              message: 'Services will appear here once they are published.',
            )
          else
            ...citizen.onlineServices.map(
              (s) => AppCard(
                padding: const EdgeInsets.all(AppTheme.xxl),
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final wide = constraints.maxWidth >= 520;
                    final action = AppButton(
                      label: t.submitRequest,
                      icon: Icons.chevron_right,
                      size: AppButtonSize.small,
                      expand: wide,
                      onPressed: token == null
                          ? null
                          : () =>
                              _showSubmitDialog(context, token, s.id, s.name),
                    );

                    final details = Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          ServiceTranslations.translate(context, s.name),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w900,
                            fontSize: 20,
                          ),
                        ),
                        const SizedBox(height: AppTheme.xs),
                        Text(
                          ServiceTranslations.translate(context, s.description),
                          maxLines: wide ? 2 : 3,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                        if ((s.sectorName ?? '').trim().isNotEmpty) ...[
                          const SizedBox(height: AppTheme.sm),
                          Text(
                            ServiceTranslations.translate(context, s.sectorName).toUpperCase(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.labelSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                              color: theme.colorScheme.primary,
                              letterSpacing: 0.6,
                            ),
                          ),
                        ],
                      ],
                    );

                    if (wide) {
                      return Row(
                        children: [
                          Expanded(child: details),
                          const SizedBox(width: AppTheme.lg),
                          action,
                        ],
                      );
                    }

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        details,
                        const SizedBox(height: AppTheme.lg),
                        action,
                      ],
                    );
                  },
                ),
              ),
            ),
          const SizedBox(height: AppTheme.xxl),
          AppSectionHeader(t.myRequestHistory),
          const SizedBox(height: AppTheme.md),
          if (citizen.onlineRequests.isEmpty)
            const EmptyStateWidget(
              icon: Icons.history_outlined,
              title: 'No requests yet',
              message: 'Your online service requests will appear here.',
            )
          else
            ...citizen.onlineRequests.map(
              (r) => AppCard(
                margin: const EdgeInsets.only(bottom: AppTheme.md),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                      ),
                      child: Icon(
                        Icons.description_outlined,
                        color: theme.colorScheme.primary,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: AppTheme.lg),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            ServiceTranslations.translate(context, r.service?.name),
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: AppTheme.xs),
                          Text(
                            r.remarks,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppTheme.md),
                    _statusBadge(context, r.status),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
