import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/providers/user_provider.dart';
import '../auth/phone_auth_screen.dart';
import '../home/home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuthentication();
  }

  Future<void> _checkAuthentication() async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);

    // Wait a bit for splash animation
    await Future.delayed(const Duration(seconds: 2));

    // Check if user is authenticated
    final isAuthenticated = await userProvider.validateSession();

    if (!mounted) return;

    // Navigate to appropriate screen
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (context) =>
            isAuthenticated ? const HomeScreen() : const AuthScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: AppColors.gradientPrimary,
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // App Logo
              Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(30),
                  child: Image.asset('assets/icon.png', fit: BoxFit.cover),
                ),
              ),
              const SizedBox(height: 30),
              // App Name
              const Text(
                'Friends Cars',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              // Tagline
              const Text(
                'Buy & Sell Cars with Ease',
                style: TextStyle(fontSize: 16, color: Colors.white70),
              ),
              const SizedBox(height: 50),
              // Loading Indicator
              const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
