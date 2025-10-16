import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'dart:io';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/providers/user_provider.dart';
import '../../core/services/car_service.dart';

class SellCarScreen extends StatefulWidget {
  const SellCarScreen({super.key});

  @override
  State<SellCarScreen> createState() => _SellCarScreenState();
}

class _SellCarScreenState extends State<SellCarScreen>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  final _formKey = GlobalKey<FormState>();
  final CarService _carService = CarService();
  final ImagePicker _picker = ImagePicker();

  // Form controllers
  final TextEditingController _modelController = TextEditingController();
  final TextEditingController _registrationController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _kmController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _ownerNameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();

  // Dropdown values
  String? _selectedBrand;
  String? _selectedYear;
  String _fuelType = 'Petrol';
  String _transmission = 'Manual';
  String _ownerNumber = '1st Owner';

  // Images
  List<File> _images = [];
  bool _isSubmitting = false;

  // Upload status
  final ValueNotifier<String> _uploadStatus = ValueNotifier<String>('');

  // Car brands
  final List<String> _carBrands = [
    'Ashok Leyland',
    'Audi',
    'Bentley',
    'BMW',
    'Chevrolet',
    'Datsun',
    'Ferrari',
    'Fiat',
    'Force Motors',
    'Ford',
    'Honda',
    'Hyundai',
    'Isuzu',
    'Jaguar',
    'Jeep',
    'Kia',
    'Lamborghini',
    'Land Rover',
    'Lexus',
    'Mahindra',
    'Maruti Suzuki',
    'Maserati',
    'Mercedes-Benz',
    'MG (Morris Garages)',
    'Mini',
    'Mitsubishi',
    'Nissan',
    'Porsche',
    'Renault',
    'Rolls Royce',
    'Skoda',
    'Tata',
    'Toyota',
    'Volkswagen',
    'Volvo',
  ];

  List<String> get _years {
    final currentYear = DateTime.now().year;
    return List.generate(
      currentYear - 1989,
      (i) => (1990 + i).toString(),
    ).reversed.toList();
  }

  @override
  void dispose() {
    _modelController.dispose();
    _registrationController.dispose();
    _priceController.dispose();
    _kmController.dispose();
    _descriptionController.dispose();
    _ownerNameController.dispose();
    _phoneController.dispose();
    _locationController.dispose();
    _uploadStatus.dispose();
    _carService.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    if (_images.length >= 7) {
      _showSnackBar('Maximum 7 images allowed', isError: true);
      return;
    }

    try {
      final List<XFile> pickedFiles = await _picker.pickMultiImage(
        imageQuality: 50,
      );

      if (pickedFiles.isNotEmpty) {
        final remainingSlots = 7 - _images.length;
        final filesToAdd = pickedFiles.take(remainingSlots);

        setState(() {
          _images.addAll(filesToAdd.map((xfile) => File(xfile.path)));
        });

        if (pickedFiles.length > remainingSlots) {
          _showSnackBar(
            'Only ${remainingSlots} image(s) added. Maximum limit reached.',
            isError: true,
          );
        }
      }
    } catch (e) {
      _showSnackBar('Failed to pick images', isError: true);
    }
  }

  void _removeImage(int index) {
    setState(() {
      _images.removeAt(index);
    });
  }

  Future<File?> _compressImage(File file) async {
    try {
      final filePath = file.absolute.path;
      final lastIndex = filePath.lastIndexOf('.');
      final splitPath = filePath.substring(0, lastIndex);
      final outPath = '${splitPath}_compressed${filePath.substring(lastIndex)}';

      final result = await FlutterImageCompress.compressAndGetFile(
        file.absolute.path,
        outPath,
        quality: 70,
        minWidth: 1024,
        minHeight: 1024,
      );

      if (result != null) {
        return File(result.path);
      }
      return null;
    } catch (e) {
      print('Error compressing image: $e');
      return file; // Return original if compression fails
    }
  }

  bool _validateForm() {
    if (_images.isEmpty) {
      _showSnackBar('Please add at least one image', isError: true);
      return false;
    }
    return _formKey.currentState?.validate() ?? false;
  }

  Future<void> _submitCar() async {
    if (!_validateForm()) return;

    setState(() {
      _isSubmitting = true;
    });

    // Show upload dialog
    if (!mounted) return;
    _showUploadDialog();

    try {
      final user = Provider.of<UserProvider>(context, listen: false).user;
      if (user == null) {
        throw Exception('Please login to sell a car');
      }

      // Compress and upload images
      List<String> imageUrls = [];
      try {
        // Update dialog with compression status
        _updateUploadDialog('Compressing images...');

        List<File> compressedImages = [];
        for (int i = 0; i < _images.length; i++) {
          _updateUploadDialog(
            'Compressing image ${i + 1} of ${_images.length}...',
          );
          final compressed = await _compressImage(_images[i]);
          if (compressed != null) {
            compressedImages.add(compressed);
          }
        }

        // Update dialog with upload status
        _updateUploadDialog('Uploading images...');
        imageUrls = await _carService.uploadImages(compressedImages);
      } catch (uploadError) {
        // Close upload dialog
        if (mounted) Navigator.of(context).pop();

        // Show specific error for upload failure
        _showSnackBar(
          'Image upload failed: ${uploadError.toString()}. Please try again or contact support.',
          isError: true,
        );
        return;
      }

      if (imageUrls.isEmpty) {
        throw Exception('No images were uploaded successfully');
      }

      // Update dialog with submission status
      _updateUploadDialog('Submitting car details...');

      // Prepare car data
      final carData = {
        'carBrand': _selectedBrand,
        'carModel': _modelController.text.trim(),
        'carStatus': 'pending',
        'exceptedPrice': int.parse(_priceController.text.trim()),
        'fuelType': _fuelType,
        'km': int.parse(_kmController.text.trim()),
        'location': _locationController.text.trim(),
        'modelYear': _selectedYear,
        'ownerName': _ownerNameController.text.trim(),
        'ownerNumber': _ownerNumber,
        'phoneNumber': _phoneController.text.trim(),
        'postedBy': user.uid,
        'postedDate': DateTime.now().toIso8601String().split('T')[0],
        'registrationNumber': _registrationController.text.trim().toUpperCase(),
        'description': _descriptionController.text.trim(),
        'transmissionType': _transmission,
        'images': imageUrls,
      };

      await _carService.postCarForApproval(carData);

      if (mounted) {
        // Close upload dialog
        Navigator.of(context).pop();

        // Show success dialog
        _showSuccessDialog();
      }
    } catch (e) {
      // Close upload dialog
      if (mounted) Navigator.of(context).pop();

      _showSnackBar('Failed to submit: ${e.toString()}', isError: true);
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  void _showSuccessDialog() {
    // Clear form
    _formKey.currentState?.reset();
    _modelController.clear();
    _registrationController.clear();
    _priceController.clear();
    _kmController.clear();
    _descriptionController.clear();
    _ownerNameController.clear();
    _phoneController.clear();
    _locationController.clear();
    setState(() {
      _selectedBrand = null;
      _selectedYear = null;
      _fuelType = 'Petrol';
      _transmission = 'Manual';
      _ownerNumber = '1st Owner';
      _images = [];
    });

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.accent2],
                  ),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 48),
              ),
              const SizedBox(height: 24),
              Text('Success!', style: AppTypography.h3Style()),
              const SizedBox(height: 12),
              Text(
                'Your car has been submitted for approval. We\'ll notify you once it\'s reviewed.',
                style: AppTypography.body1Style(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop(); // Close dialog
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Done',
                    style: AppTypography.subtitle1Style(color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showUploadDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => PopScope(
        canPop: false,
        child: Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.accent2],
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.cloud_upload,
                    color: Colors.white,
                    size: 48,
                  ),
                ),
                const SizedBox(height: 24),
                Text('Uploading Car', style: AppTypography.h3Style()),
                const SizedBox(height: 12),
                ValueListenableBuilder<String>(
                  valueListenable: _uploadStatus,
                  builder: (context, status, child) {
                    return Text(
                      status,
                      style: AppTypography.body1Style(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    );
                  },
                ),
                const SizedBox(height: 24),
                const CircularProgressIndicator(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _updateUploadDialog(String status) {
    _uploadStatus.value = status;
  }

  void _showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red.shade600 : AppColors.success,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8), // Reduced top padding
              _buildImageSection(),
              const SizedBox(height: 24),
              _buildVehicleDetailsSection(),
              const SizedBox(height: 24),
              _buildPricingSection(),
              const SizedBox(height: 24),
              _buildOwnerInfoSection(),
              const SizedBox(height: 32),
              _buildSubmitButton(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImageSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.accent2],
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.photo_camera,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Vehicle Photos',
                    style: AppTypography.subtitle1Style().copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    'Upload up to 7 images',
                    style: AppTypography.captionStyle(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_images.isEmpty) _buildEmptyImagePicker() else _buildImageGrid(),
        ],
      ),
    );
  }

  Widget _buildEmptyImagePicker() {
    return GestureDetector(
      onTap: _pickImages,
      child: Container(
        height: 180,
        decoration: BoxDecoration(
          color: AppColors.backgroundLight,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.primary.withOpacity(0.3),
            width: 2,
            style: BorderStyle.solid,
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.cloud_upload_outlined,
                size: 48,
                color: AppColors.primary.withOpacity(0.5),
              ),
              const SizedBox(height: 12),
              Text(
                'Upload Photos',
                style: AppTypography.subtitle1Style(
                  color: AppColors.primary,
                ).copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 4),
              Text(
                'Tap to select images',
                style: AppTypography.captionStyle(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImageGrid() {
    return Column(
      children: [
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemCount: _images.length,
          itemBuilder: (context, index) {
            return Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.file(
                    _images[index],
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                  ),
                ),
                Positioned(
                  top: 4,
                  right: 4,
                  child: GestureDetector(
                    onTap: () => _removeImage(index),
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.close,
                        color: Colors.white,
                        size: 16,
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
        if (_images.length < 7) ...[
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _pickImages,
            icon: const Icon(Icons.add_photo_alternate),
            label: Text('Add More Photos (${_images.length}/7)'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: const BorderSide(color: AppColors.primary),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildVehicleDetailsSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Vehicle Details',
            style: AppTypography.subtitle1Style().copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _selectedBrand,
            decoration: _inputDecoration('Car Brand *'),
            items: _carBrands.map((brand) {
              return DropdownMenuItem(value: brand, child: Text(brand));
            }).toList(),
            onChanged: (value) => setState(() => _selectedBrand = value),
            validator: (value) =>
                value == null ? 'Please select a brand' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _modelController,
            decoration: _inputDecoration('Car Model *'),
            validator: (value) =>
                value?.isEmpty ?? true ? 'Please enter car model' : null,
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _selectedYear,
            decoration: _inputDecoration('Manufacturing Year *'),
            items: _years.map((year) {
              return DropdownMenuItem(value: year, child: Text(year));
            }).toList(),
            onChanged: (value) => setState(() => _selectedYear = value),
            validator: (value) => value == null ? 'Please select year' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _registrationController,
            decoration: _inputDecoration('Registration Number *'),
            textCapitalization: TextCapitalization.characters,
            validator: (value) => value?.isEmpty ?? true
                ? 'Please enter registration number'
                : null,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _fuelType,
                  decoration: _inputDecoration('Fuel Type'),
                  items: ['Petrol', 'Diesel', 'CNG', 'EV', 'Hybrid']
                      .map(
                        (fuel) =>
                            DropdownMenuItem(value: fuel, child: Text(fuel)),
                      )
                      .toList(),
                  onChanged: (value) =>
                      setState(() => _fuelType = value ?? 'Petrol'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _transmission,
                  decoration: _inputDecoration('Transmission'),
                  items: ['Manual', 'Automatic']
                      .map(
                        (trans) =>
                            DropdownMenuItem(value: trans, child: Text(trans)),
                      )
                      .toList(),
                  onChanged: (value) =>
                      setState(() => _transmission = value ?? 'Manual'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPricingSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Pricing & Specifications',
            style: AppTypography.subtitle1Style().copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _priceController,
                  decoration: _inputDecoration('Expected Price (₹) *'),
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'Please enter price' : null,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _kmController,
                  decoration: _inputDecoration('KM Driven *'),
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'Please enter kilometers' : null,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _descriptionController,
            decoration: _inputDecoration('Vehicle Description *'),
            maxLines: 4,
            validator: (value) =>
                value?.isEmpty ?? true ? 'Please enter description' : null,
          ),
        ],
      ),
    );
  }

  Widget _buildOwnerInfoSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Owner Information',
            style: AppTypography.subtitle1Style().copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _ownerNumber,
            decoration: _inputDecoration('Owner Number'),
            items:
                [
                      '1st Owner',
                      '2nd Owner',
                      '3rd Owner',
                      '4th Owner',
                      '5th Owner',
                      '5+ Owner',
                    ]
                    .map(
                      (owner) =>
                          DropdownMenuItem(value: owner, child: Text(owner)),
                    )
                    .toList(),
            onChanged: (value) =>
                setState(() => _ownerNumber = value ?? '1st Owner'),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _ownerNameController,
            decoration: _inputDecoration('Owner Name *'),
            validator: (value) =>
                value?.isEmpty ?? true ? 'Please enter owner name' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _phoneController,
            decoration: _inputDecoration('Phone Number *'),
            keyboardType: TextInputType.phone,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(10),
            ],
            validator: (value) {
              if (value?.isEmpty ?? true) return 'Please enter phone number';
              if (value!.length != 10) return 'Phone number must be 10 digits';
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _locationController,
            decoration: _inputDecoration('Address *'),
            maxLines: 3,
            validator: (value) =>
                value?.isEmpty ?? true ? 'Please enter address' : null,
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitButton() {
    return Container(
      width: double.infinity,
      height: 56,
      decoration: BoxDecoration(
        gradient: _isSubmitting
            ? null
            : LinearGradient(
                colors: [AppColors.primary, AppColors.accent2],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
        color: _isSubmitting ? AppColors.grey : null,
        borderRadius: BorderRadius.circular(16),
        boxShadow: _isSubmitting
            ? null
            : [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _isSubmitting ? null : _submitCar,
          borderRadius: BorderRadius.circular(16),
          splashColor: Colors.white.withOpacity(0.1),
          highlightColor: Colors.white.withOpacity(0.2),
          child: Center(
            child: _isSubmitting
                ? const SizedBox(
                    height: 24,
                    width: 24,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : Text(
                    'Submit for Approval',
                    style: AppTypography.subtitle1Style(
                      color: Colors.white,
                    ).copyWith(fontWeight: FontWeight.w600),
                  ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: AppTypography.body2Style(color: AppColors.textSecondary),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.grey.withOpacity(0.3)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.grey.withOpacity(0.3)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.red, width: 1),
      ),
      filled: true,
      fillColor: AppColors.backgroundLight,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }
}
