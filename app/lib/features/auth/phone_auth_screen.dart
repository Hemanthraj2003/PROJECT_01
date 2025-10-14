import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import 'otp_screen.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _phoneController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  bool _validatePhoneNumber(String number) {
    return number.length == 10 && RegExp(r'^\d+$').hasMatch(number);
  }

  Future<void> _confirmNumber() async {
    setState(() {
      _errorMessage = null;
    });

    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Simulate sending OTP
      await Future.delayed(const Duration(seconds: 1));

      if (!mounted) return;

      // Navigate to OTP screen
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => OTPScreen(phoneNumber: _phoneController.text),
        ),
      );
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to send OTP. Please try again.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
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
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 20,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: Image.asset('assets/icon.png', fit: BoxFit.cover),
                    ),
                  ),
                  const SizedBox(height: 30),

                  // App Name
                  Text(
                    'Friends Cars',
                    style: AppTypography.h1Style(color: Colors.white),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Buy & Sell Cars with Ease',
                    style: AppTypography.body1Style(
                      color: Colors.white.withOpacity(0.9),
                    ),
                  ),
                  const SizedBox(height: 50),

                  // Phone Number Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.phone_android,
                                color: AppColors.primary,
                                size: 28,
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'Enter Your Number',
                                style: AppTypography.h3Style(
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'We will send you an OTP to verify',
                            style: AppTypography.body2Style(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Phone Number Input
                          TextFormField(
                            controller: _phoneController,
                            keyboardType: TextInputType.phone,
                            maxLength: 10,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                            ],
                            decoration: InputDecoration(
                              prefixIcon: Icon(
                                Icons.phone,
                                color: AppColors.primary,
                              ),
                              hintText: '10-digit mobile number',
                              counterText: '',
                              filled: true,
                              fillColor: AppColors.backgroundLight,
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter your phone number';
                              }
                              if (!_validatePhoneNumber(value)) {
                                return 'Please enter a valid 10-digit number';
                              }
                              return null;
                            },
                          ),

                          if (_errorMessage != null) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.error.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.error_outline,
                                    color: AppColors.error,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      _errorMessage!,
                                      style: AppTypography.body2Style(
                                        color: AppColors.error,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],

                          const SizedBox(height: 24),

                          // Continue Button
                          SizedBox(
                            width: double.infinity,
                            height: 50,
                            child: _isLoading
                                ? Center(
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation(
                                        AppColors.primary,
                                      ),
                                    ),
                                  )
                                : ElevatedButton(
                                    onPressed: _confirmNumber,
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          'Continue',
                                          style: AppTypography.subtitle1Style(
                                            color: Colors.white,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        const Icon(
                                          Icons.arrow_forward,
                                          color: Colors.white,
                                        ),
                                      ],
                                    ),
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 30),

                  // Privacy Info
                  Text(
                    'By continuing, you agree to our Terms & Privacy Policy',
                    textAlign: TextAlign.center,
                    style: AppTypography.captionStyle(
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
