import 'package:flutter/material.dart';

/// A Material 3 filled button that shows a small inline progress indicator
/// while [isLoading] is true, without changing the button's size.
class LoadingFilledButton extends StatefulWidget {
  const LoadingFilledButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.isLoading = false,
    this.loadingLabel,
    this.icon,
    this.style,
  });

  final VoidCallback? onPressed;
  final Widget child;
  final bool isLoading;
  final String? loadingLabel;
  final IconData? icon;
  final ButtonStyle? style;

  @override
  State<LoadingFilledButton> createState() => _LoadingFilledButtonState();
}

class _LoadingFilledButtonState extends State<LoadingFilledButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null && !widget.isLoading;
    final effectiveOnPressed = enabled ? widget.onPressed : null;
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final label = AnimatedSwitcher(
      duration: const Duration(milliseconds: 180),
      switchInCurve: Curves.easeOut,
      switchOutCurve: Curves.easeIn,
      child: widget.isLoading
          ? Row(
              key: const ValueKey('loading'),
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation(colorScheme.onPrimary),
                  ),
                ),
                const SizedBox(width: 10),
                Text(widget.loadingLabel ?? 'Loading...'),
              ],
            )
          : Row(
              key: const ValueKey('idle'),
              mainAxisSize: MainAxisSize.min,
              children: [
                if (widget.icon != null) ...[
                  Icon(widget.icon, size: 18),
                  const SizedBox(width: 8),
                ],
                widget.child,
              ],
            ),
    );

    final defaultStyle = FilledButton.styleFrom(
      minimumSize: const Size.fromHeight(48),
      textStyle: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    );

    return AnimatedScale(
      scale: _pressed ? 0.97 : 1,
      duration: const Duration(milliseconds: 90),
      curve: Curves.easeOut,
      child: Listener(
        onPointerDown: enabled ? (_) => setState(() => _pressed = true) : null,
        onPointerUp: enabled ? (_) => setState(() => _pressed = false) : null,
        onPointerCancel: enabled ? (_) => setState(() => _pressed = false) : null,
        child: FilledButton(
          style: defaultStyle.merge(widget.style),
          onPressed: effectiveOnPressed,
          child: label,
        ),
      ),
    );
  }
}
