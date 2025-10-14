import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/providers/user_provider.dart';
import '../../core/services/user_service.dart';
import '../home/home_screen.dart';

class SignupScreen extends StatefulWidget {
  final String phoneNumber;

  const SignupScreen({super.key, required this.phoneNumber});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();

  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  Future<void> _completeSignup() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final userService = UserService();

      // Create new user (backend expects 'phone' not 'phoneNumber')
      final newUser = await userService.registerNewUser({
        'phone': widget.phoneNumber,
        'name': _nameController.text.trim(),
        'city': _cityController.text.trim(),
        'state': _stateController.text.trim(),
      });

      if (!mounted) return;

      // Set user in provider
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      await userProvider.setUser(newUser);

      // Navigate to home
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const HomeScreen()),
        (route) => false,
      );
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to create account. Please try again.';
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
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Complete Your Profile',
                      style: AppTypography.h3Style(color: Colors.white),
                    ),
                  ],
                ),
              ),

              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Container(
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
                          // Name Field
                          Text(
                            'Name',
                            style: AppTypography.subtitle2Style(
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _nameController,
                            decoration: InputDecoration(
                              hintText: 'Enter your full name',
                              prefixIcon: Icon(
                                Icons.person_outline,
                                color: AppColors.primary,
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Please enter your name';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),

                          // City Field
                          Text(
                            'City',
                            style: AppTypography.subtitle2Style(
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _cityController,
                            decoration: InputDecoration(
                              hintText: 'Enter your city',
                              prefixIcon: Icon(
                                Icons.location_city_outlined,
                                color: AppColors.primary,
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Please enter your city';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),

                          // State Field
                          Text(
                            'State',
                            style: AppTypography.subtitle2Style(
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _stateController,
                            decoration: InputDecoration(
                              hintText: 'Enter your state',
                              prefixIcon: Icon(
                                Icons.map_outlined,
                                color: AppColors.primary,
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Please enter your state';
                              }
                              return null;
                            },
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

                          const SizedBox(height: 30),

                          // Submit Button
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
                                    onPressed: _completeSignup,
                                    child: Text(
                                      'Complete Signup',
                                      style: AppTypography.subtitle1Style(
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                          ),
                        ],
                      ),
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
