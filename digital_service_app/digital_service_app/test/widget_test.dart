import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:digital_service_app/main.dart';
import 'package:digital_service_app/providers/auth_provider.dart';
import 'package:digital_service_app/providers/citizen_provider.dart';
import 'package:digital_service_app/services/api_service.dart';
import 'package:digital_service_app/services/session_service.dart';

void main() {
  testWidgets('App renders login screen when unauthenticated', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider(ApiService(), SessionService())),
          ChangeNotifierProvider(create: (_) => CitizenProvider(ApiService())),
        ],
        child: const MaterialApp(home: RootScreen()),
      ),
    );
    expect(find.text('Citizen Login'), findsOneWidget);
  });
}
