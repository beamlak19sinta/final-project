import 'package:flutter/material.dart';
import '../../main.dart';

class LanguageSelector extends StatelessWidget {
  const LanguageSelector({super.key});

  @override
  Widget build(BuildContext context) {
    final currentLocale = Localizations.localeOf(context);
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    final label = currentLocale.languageCode == 'am' ? 'አማ' : 'EN';
    return PopupMenuButton<Locale>(
      tooltip: 'Change Language / ቋንቋ ይቀይሩ',
      onSelected: (Locale locale) {
        DigitalServiceApp.setLocale(context, locale);
      },
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: cs.outline.withValues(alpha: 0.60)),
      ),
      elevation: 10,
      child: Container(
        decoration: ShapeDecoration(
          color: cs.surface.withValues(alpha: 0.92),
          shadows: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.10),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
          shape: StadiumBorder(
            side: BorderSide(color: cs.outline.withValues(alpha: 0.70)),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(width: 10),
            Icon(Icons.language, size: 16, color: cs.onSurface),
            const SizedBox(width: 6),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w800,
                letterSpacing: 0.6,
                color: cs.onSurface,
              ),
            ),
            const SizedBox(width: 2),
            Icon(
              Icons.expand_more,
              size: 18,
              color: cs.onSurface.withValues(alpha: 0.70),
            ),
            const SizedBox(width: 6),
          ],
        ),
      ),
      itemBuilder: (BuildContext context) => <PopupMenuEntry<Locale>>[
        const PopupMenuItem<Locale>(
          value: Locale('en'),
          child: Text('English'),
        ),
        const PopupMenuItem<Locale>(
          value: Locale('am'),
          child: Text('አማርኛ (Amharic)'),
        ),
      ],
    );
  }
}
