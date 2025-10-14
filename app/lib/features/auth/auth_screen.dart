import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class AuthScreen extends StatelessWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Auth Screen',
              style: Theme.of(context).textTheme.displayMedium,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // TODO: Implement authentication
              },
              child: const Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}
