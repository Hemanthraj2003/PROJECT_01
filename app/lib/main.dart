import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/providers/user_provider.dart';
import 'core/providers/car_provider.dart';
import 'features/splash/splash_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => CarProvider()),
      ],
      child: MaterialApp(
        title: 'Friends Cars',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const SplashScreen(),
      ),
    );
  }
}
