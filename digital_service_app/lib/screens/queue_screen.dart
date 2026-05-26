import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_theme.dart';
import '../models/queue_ticket.dart';
import '../providers/auth_provider.dart';
import '../providers/citizen_provider.dart';
import '../services/api_service.dart';
import 'package:digital_service_app/l10n/app_localizations.dart';
import '../l10n/service_translations.dart';
import '../widgets/app_button.dart';
import '../widgets/app_card.dart';
import '../widgets/app_loading_overlay.dart';

class QueueScreen extends StatefulWidget {
  const QueueScreen({super.key});

  @override
  State<QueueScreen> createState() => _QueueScreenState();
}

class _QueueScreenState extends State<QueueScreen> {
  bool _isLoading = false;

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
    final theme = Theme.of(context);
    final color = _statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.md, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        ServiceTranslations.translate(context, status).toUpperCase(),
        style: theme.textTheme.labelSmall?.copyWith(
          color: color,
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

  @override
  Widget build(BuildContext context) {
    final citizen = context.watch<CitizenProvider>();
    final token = context.read<AuthProvider>().token;
    final citizenProvider = context.read<CitizenProvider>();
    final api = context.read<ApiService>();
    final theme = Theme.of(context);
    final t = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(t.queue)),
      body: AppLoadingOverlay(
        isLoading: _isLoading,
        child: ListView(
          padding: const EdgeInsets.all(AppTheme.lg),
          children: [
            Text(
              t.queue,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w900,
                fontSize: 28,
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(height: AppTheme.xxl),
            // Active queue section
            if (citizen.activeQueue != null) ...[
              AppSectionHeader(t.activeTicket),
              const SizedBox(height: AppTheme.lg),
              _ActiveQueueCard(
                queue: citizen.activeQueue!,
                onCancel: token == null
                    ? null
                    : () async {
                        setState(() => _isLoading = true);
                        try {
                          await api.cancelQueueTicket(
                            token: token,
                            queueId: citizen.activeQueue!.id,
                          );
                          await citizenProvider.loadAll(token);
                          _showFeedback(t.ticketCancelled);
                        } catch (e) {
                          _showFeedback(e.toString(), isError: true);
                        } finally {
                          if (mounted) {
                            setState(() => _isLoading = false);
                          }
                        }
                      },
              ),
              const SizedBox(height: AppTheme.xxl),
            ],

            // Available services section
            if (citizen.activeQueue == null) ...[
              AppSectionHeader(t.availableServices),
              const SizedBox(height: AppTheme.lg),
              if (citizen.queueServices.isEmpty)
                EmptyStateWidget(
                  icon: Icons.confirmation_number_outlined,
                  title: t.noServicesAvailable,
                  message: 'Check back later for queue services',
                )
              else
                ...citizen.queueServices.map(
                  (s) => AppCard(
                    margin: const EdgeInsets.only(bottom: AppTheme.md),
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        final wide = constraints.maxWidth >= 520;
                        final action = AppButton(
                          label: t.join,
                          icon: Icons.chevron_right,
                          expand: wide,
                          size: AppButtonSize.small,
                          onPressed: token == null
                              ? null
                              : () async {
                                  setState(() => _isLoading = true);
                                  try {
                                    await api.joinQueue(
                                      token: token,
                                      serviceId: s.id,
                                    );
                                    await citizenProvider.loadAll(token);
                                    _showFeedback(t.joinedQueueSuccess);
                                  } catch (e) {
                                    _showFeedback(e.toString(), isError: true);
                                  } finally {
                                    if (mounted) {
                                      setState(() => _isLoading = false);
                                    }
                                  }
                                },
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
            ],

            // History section
            AppSectionHeader(t.history),
            const SizedBox(height: AppTheme.lg),
            if (citizen.queueHistory.isEmpty)
              EmptyStateWidget(
                icon: Icons.history_outlined,
                title: t.noQueueHistory,
                message: 'Your queue history will appear here',
              )
            else
              ...citizen.queueHistory.map(
                (q) => AppCard(
                  margin: const EdgeInsets.only(bottom: AppTheme.md),
                  child: Row(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withValues(
                            alpha: 0.1,
                          ),
                          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                        ),
                        child: Center(
                          child: Text(
                            '#${q.ticketNumber}',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.primary,
                              fontWeight: FontWeight.w900,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                      const SizedBox(width: AppTheme.lg),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              ServiceTranslations.translate(context, q.service?.name),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const SizedBox(height: AppTheme.xs),
                            Text(
                              q.createdAt.toString().split(' ')[0],
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: AppTheme.md),
                      _statusBadge(context, q.status),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Modern active queue card widget
class _ActiveQueueCard extends StatelessWidget {
  const _ActiveQueueCard({required this.queue, required this.onCancel});

  final QueueTicket queue;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final t = AppLocalizations.of(context)!;

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.primary,
        borderRadius: BorderRadius.circular(40),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.primary.withValues(alpha: 0.2),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      padding: const EdgeInsets.all(AppTheme.xxxl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppTheme.md, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
            ),
            child: Text(
              ServiceTranslations.translate(context, queue.status).toUpperCase(),
              style: theme.textTheme.labelSmall?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                letterSpacing: 0.3,
              ),
            ),
          ),
          const SizedBox(height: AppTheme.lg),
          Text(
            ServiceTranslations.translate(context, queue.service?.name),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.headlineSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 28,
              letterSpacing: -0.2,
            ),
          ),
          const SizedBox(height: AppTheme.lg),
          Wrap(
            spacing: AppTheme.xxl,
            runSpacing: AppTheme.md,
            children: [
              _ActiveInfo(
                icon: Icons.schedule,
                text: '${queue.peopleAhead * 5} mins',
              ),
              _ActiveInfo(
                icon: Icons.confirmation_number_outlined,
                text: ServiceTranslations.translate(context, queue.service?.sectorName),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.xxl),
          LayoutBuilder(
            builder: (context, constraints) {
              final wide = constraints.maxWidth >= 520;
              final metrics = Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _BigMetric(label: t.ticketNo, value: '${queue.ticketNumber}'),
                  if (wide)
                    Container(
                      width: 1,
                      height: 56,
                      margin: const EdgeInsets.symmetric(horizontal: AppTheme.xxl),
                      color: Colors.white.withValues(alpha: 0.2),
                    )
                  else
                    const SizedBox(width: AppTheme.xxl),
                  _BigMetric(label: t.peopleAhead, value: '${queue.peopleAhead}'),
                ],
              );
              return metrics;
            },
          ),
          const SizedBox(height: AppTheme.xxl),
          SizedBox(
            width: double.infinity,
            child: AppButton(
              label: t.cancelTicket,
              icon: Icons.close,
              destructive: true,
              variant: AppButtonVariant.outlined,
              onPressed: onCancel,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActiveInfo extends StatelessWidget {
  const _ActiveInfo({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (text.trim().isEmpty) return const SizedBox.shrink();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 18, color: Colors.white.withValues(alpha: 0.75)),
        const SizedBox(width: AppTheme.sm),
        Text(
          text,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: Colors.white.withValues(alpha: 0.9),
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

class _BigMetric extends StatelessWidget {
  const _BigMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Text(
          label.toUpperCase(),
          style: theme.textTheme.labelSmall?.copyWith(
            color: Colors.white.withValues(alpha: 0.7),
            fontWeight: FontWeight.w900,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: AppTheme.sm),
        Text(
          value,
          style: theme.textTheme.displaySmall?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}
