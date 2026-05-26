import 'package:flutter/material.dart';
import 'responsive.dart';

/// A consistent mobile scaffold wrapper:
/// - safe area
/// - comfortable max width on tablets
/// - standard page padding
class ScreenScaffold extends StatelessWidget {
  const ScreenScaffold({
    super.key,
    required this.title,
    required this.children,
    this.actions,
    this.floatingActionButton,
    this.physics,
    this.padding,
  });

  final String title;
  final List<Widget> children;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final ScrollPhysics? physics;
  final EdgeInsets? padding;

  @override
  Widget build(BuildContext context) {
    final maxWidth = Responsive.contentMaxWidth(context);
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final effectivePadding = padding ??
        EdgeInsets.all(
          Responsive.isCompact(context) ? 16 : 24,
        );
    return Scaffold(
      appBar: AppBar(title: Text(title), actions: actions),
      floatingActionButton: floatingActionButton,
      body: SafeArea(
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                cs.primary.withValues(alpha: 0.06),
                theme.scaffoldBackgroundColor,
              ],
            ),
          ),
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: maxWidth),
              child: ListView(
                physics: physics,
                padding: effectivePadding,
                keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                children: children,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
