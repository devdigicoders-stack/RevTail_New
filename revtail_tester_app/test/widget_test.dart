import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:revtail_tester_app/screens/no_internet_screen.dart';

void main() {
  testWidgets('NoInternetScreen renders properly', (WidgetTester tester) async {
    bool retried = false;
    await tester.pumpWidget(
      MaterialApp(
        home: NoInternetScreen(
          onRetry: () {
            retried = true;
          },
        ),
      ),
    );

    expect(find.text('No Internet Connection'), findsOneWidget);
    expect(find.text('Try Again'), findsOneWidget);

    await tester.tap(find.text('Try Again'));
    expect(retried, isTrue);
  });
}
