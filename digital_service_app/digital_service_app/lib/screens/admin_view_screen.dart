import 'package:flutter/material.dart';

class AdminViewScreen extends StatelessWidget {
  const AdminViewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Card(
        margin: EdgeInsets.all(24),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            'Admin view placeholder.\nConnect this screen to protected admin endpoints.',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
