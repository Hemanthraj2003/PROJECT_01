import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/providers/user_provider.dart';
import '../../core/services/user_service.dart';
import '../../core/models/user_model.dart';
import '../home/home_screen.dart';
import 'signup_screen.dart';
import 'dart:async';

class OTPScreen extends StatefulWidget {
  final String phoneNumber;

  const OTPScreen({super.key, required this.phoneNumber});

  @override
  State<OTPScreen> createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  final List<TextEditingController> _otpControllers = List.generate(
    4,
    (index) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(4, (index) => FocusNode());

  bool _isVerifying = false;
  String? _errorMessage;
  String? _successMessage;

  // Resend OTP state
  bool _canResend = false;
  int _resendCountdown = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startResendCountdown();
  }

  @override
  void dispose() {
    for (var controller in _otpControllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    _timer?.cancel();
    super.dispose();
  }

  void _startResendCountdown() {
    setState(() {
      _canResend = false;
      _resendCountdown = 30;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_resendCountdown > 0) {
          _resendCountdown--;
        } else {
          _canResend = true;
          timer.cancel();
        }
      });
    });
  }

  Future<void> _resendOTP() async {
    if (!_canResend) return;

    setState(() {
      _successMessage = 'OTP sent successfully!';
      _errorMessage = null;
    });

    // Clear success message after 3 seconds
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _successMessage = null;
        });
      }
    });

    _startResendCountdown();
  }

  String _getOTP() {
    return _otpControllers.map((c) => c.text).join();
  }

  Future<void> _verifyOTP() async {
    final otp = _getOTP();

    if (otp.length != 4) {
      setState(() {
        _errorMessage = 'Please enter complete OTP';
      });
      return;
    }

    // Verify OTP is 0000 for dev purposes
    if (otp != '0000') {
      setState(() {
        _errorMessage = 'Invalid OTP. Use 0000 for testing.';
      });
      return;
    }

    setState(() {
      _isVerifying = true;
      _errorMessage = null;
      _successMessage = 'OTP verified successfully!';
    });

    try {
      final userService = UserService();

      // Check if user exists in database
      debugPrint('Checking if user exists for phone: ${widget.phoneNumber}');
      final result = await userService.checkForRegisteredUser(
        widget.phoneNumber,
      );
      debugPrint('User check result: $result');

      final bool userExists = result['isExists'] ?? false;
      final user = result['user'];

      debugPrint('User exists: $userExists');
      debugPrint('User data: $user');

      if (!mounted) return;

      if (userExists && user != null) {
        // Existing user - save user data and login
        final userProvider = Provider.of<UserProvider>(context, listen: false);
        await userProvider.setUser(user);

        // Small delay to show success message
        await Future.delayed(const Duration(milliseconds: 500));

        if (!mounted) return;

        // Navigate to home
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const HomeScreen()),
          (route) => false,
        );
      } else {
        // New user - navigate to signup
        await Future.delayed(const Duration(milliseconds: 500));

        if (!mounted) return;

        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) => SignupScreen(phoneNumber: widget.phoneNumber),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Verification failed: ${e.toString()}';
        _successMessage = null;
      });
    } finally {
      if (mounted) {
        setState(() {
          _isVerifying = false;
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
          child: Column(
            children: [
              // Back Button
              Align(
                alignment: Alignment.topLeft,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),

              Expanded(
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Icon
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Icon(
                            Icons.mark_email_read,
                            size: 40,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: 30),

                        // Title
                        Text(
                          'Verify OTP',
                          style: AppTypography.h2Style(color: Colors.white),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Enter the 4-digit code sent to',
                          style: AppTypography.body1Style(
                            color: Colors.white.withOpacity(0.9),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.phoneNumber,
                          style: AppTypography.subtitle1Style(
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 40),

                        // OTP Input Card
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
                          child: Column(
                            children: [
                              // OTP Input Fields
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceEvenly,
                                children: List.generate(4, (index) {
                                  return SizedBox(
                                    width: 60,
                                    height: 60,
                                    child: TextField(
                                      controller: _otpControllers[index],
                                      focusNode: _focusNodes[index],
                                      keyboardType: TextInputType.number,
                                      textAlign: TextAlign.center,
                                      maxLength: 1,
                                      style: AppTypography.h2Style(
                                        color: AppColors.textPrimary,
                                      ),
                                      inputFormatters: [
                                        FilteringTextInputFormatter.digitsOnly,
                                      ],
                                      decoration: InputDecoration(
                                        counterText: '',
                                        filled: true,
                                        fillColor: AppColors.backgroundLight,
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          borderSide: BorderSide(
                                            color: AppColors.greyLight,
                                          ),
                                        ),
                                        focusedBorder: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          borderSide: BorderSide(
                                            color: AppColors.primary,
                                            width: 2,
                                          ),
                                        ),
                                      ),
                                      onChanged: (value) {
                                        if (value.isNotEmpty && index < 3) {
                                          _focusNodes[index + 1].requestFocus();
                                        } else if (value.isEmpty && index > 0) {
                                          _focusNodes[index - 1].requestFocus();
                                        }

                                        // Auto-verify when all 4 digits entered
                                        if (index == 3 && value.isNotEmpty) {
                                          final otp = _getOTP();
                                          if (otp.length == 4) {
                                            _verifyOTP();
                                          }
                                        }
                                      },
                                    ),
                                  );
                                }),
                              ),

                              if (_errorMessage != null) ...[
                                const SizedBox(height: 16),
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

                              if (_successMessage != null) ...[
                                const SizedBox(height: 16),
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: AppColors.success.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.check_circle_outline,
                                        color: AppColors.success,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          _successMessage!,
                                          style: AppTypography.body2Style(
                                            color: AppColors.success,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],

                              const SizedBox(height: 24),

                              // Verify Button
                              SizedBox(
                                width: double.infinity,
                                height: 50,
                                child: _isVerifying
                                    ? Center(
                                        child: CircularProgressIndicator(
                                          valueColor: AlwaysStoppedAnimation(
                                            AppColors.primary,
                                          ),
                                        ),
                                      )
                                    : ElevatedButton(
                                        onPressed: _verifyOTP,
                                        child: Text(
                                          'Verify OTP',
                                          style: AppTypography.subtitle1Style(
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                              ),

                              const SizedBox(height: 16),

                              // Resend OTP
                              TextButton(
                                onPressed: _canResend ? _resendOTP : null,
                                child: Text(
                                  _canResend
                                      ? 'Resend OTP'
                                      : 'Resend OTP in $_resendCountdown sec',
                                  style: AppTypography.body2Style(
                                    color: _canResend
                                        ? AppColors.primary
                                        : AppColors.grey,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Hint
                        Text(
                          'For testing, use OTP: 0000',
                          style: AppTypography.captionStyle(
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
