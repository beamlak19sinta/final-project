import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/app_theme.dart';

/// A modern, responsive button with smooth animations and haptic feedback.
class AppButton extends StatefulWidget {
  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.isLoading = false,
    this.expand = true,
    this.destructive = false,
    this.variant = AppButtonVariant.filled,
    this.size = AppButtonSize.medium,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final bool expand;
  final bool destructive;
  final AppButtonVariant variant;
  final AppButtonSize size;

  @override
  State<AppButton> createState() => _AppButtonState();
}

enum AppButtonVariant { filled, outlined, text }

enum AppButtonSize { small, medium, large }

class _AppButtonState extends State<AppButton> {
  bool _pressed = false;

  void _setPressed(bool value) {
    if (!mounted) return;
    setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final enabled = widget.onPressed != null && !widget.isLoading;

    Color getBackgroundColor() {
      if (widget.variant == AppButtonVariant.filled) {
        return widget.destructive ? colorScheme.error : colorScheme.primary;
      }
      return Colors.transparent;
    }

    Color getForegroundColor() {
      if (widget.variant == AppButtonVariant.filled) {
        return widget.destructive ? colorScheme.onError : colorScheme.onPrimary;
      }
      return widget.destructive ? colorScheme.error : colorScheme.primary;
    }

    BorderSide getBorderSide() {
      if (widget.variant == AppButtonVariant.outlined) {
        return BorderSide(
          color: widget.destructive ? colorScheme.error : colorScheme.primary,
          width: 1.5,
        );
      }
      return BorderSide.none;
    }

    EdgeInsetsGeometry getPadding() {
      switch (widget.size) {
        case AppButtonSize.small:
          return const EdgeInsets.symmetric(
            horizontal: AppTheme.lg,
            vertical: AppTheme.md,
          );
        case AppButtonSize.medium:
          return const EdgeInsets.symmetric(
            horizontal: AppTheme.xxl,
            vertical: AppTheme.lg,
          );
        case AppButtonSize.large:
          return const EdgeInsets.symmetric(
            horizontal: AppTheme.xxxl,
            vertical: AppTheme.xl,
          );
      }
    }

    double getIconSize() {
      switch (widget.size) {
        case AppButtonSize.small:
          return 16;
        case AppButtonSize.medium:
          return 18;
        case AppButtonSize.large:
          return 20;
      }
    }

    double getTextSize() {
      switch (widget.size) {
        case AppButtonSize.small:
          return 13;
        case AppButtonSize.medium:
          return 15;
        case AppButtonSize.large:
          return 16;
      }
    }

    BorderRadius getBorderRadius() {
      switch (widget.size) {
        case AppButtonSize.small:
          return BorderRadius.circular(AppTheme.radiusMd);
        case AppButtonSize.medium:
        case AppButtonSize.large:
          return BorderRadius.circular(AppTheme.radiusLg);
      }
    }

    final backgroundColor = getBackgroundColor();
    final foregroundColor = getForegroundColor();
    final borderSide = getBorderSide();
    final padding = getPadding();
    final iconSize = getIconSize();
    final textSize = getTextSize();
    final borderRadius = getBorderRadius();
    final shadowColor = widget.destructive ? colorScheme.error : colorScheme.primary;
    final showShadow = enabled && widget.variant == AppButtonVariant.filled;

    final child = AnimatedScale(
      duration: AppTheme.durationFast,
      curve: Curves.easeOut,
      scale: _pressed && enabled ? 0.96 : 1.0,
      child: Material(
        color: backgroundColor,
        borderRadius: borderRadius,
        elevation: 0,
        shadowColor: Colors.transparent,
        child: InkWell(
          onTap: enabled ? widget.onPressed : null,
          onLongPress: enabled
              ? () {
                  HapticFeedback.mediumImpact();
                }
              : null,
          borderRadius: borderRadius,
          child: Container(
            decoration: BoxDecoration(
              border: Border.fromBorderSide(borderSide),
              borderRadius: borderRadius,
              boxShadow: showShadow
                  ? [
                      BoxShadow(
                        color: shadowColor.withValues(alpha: 0.2),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ]
                  : null,
            ),
            padding: padding,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (widget.isLoading)
                  SizedBox(
                    width: iconSize,
                    height: iconSize,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation(foregroundColor),
                    ),
                  )
                else if (widget.icon != null)
                  Icon(widget.icon, size: iconSize, color: foregroundColor),
                if (widget.icon != null && !widget.isLoading)
                  SizedBox(width: AppTheme.sm),
                Text(
                  widget.label,
                  style: TextStyle(
                    color: foregroundColor,
                    fontWeight: FontWeight.w900,
                    fontSize: textSize,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    final wrapped = Listener(
      onPointerDown: (_) {
        HapticFeedback.selectionClick();
        _setPressed(true);
      },
      onPointerUp: (_) => _setPressed(false),
      onPointerCancel: (_) => _setPressed(false),
      child: child,
    );

    if (!widget.expand) return wrapped;
    return SizedBox(width: double.infinity, child: wrapped);
  }
}
