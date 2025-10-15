import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

class FilterBottomSheet extends StatefulWidget {
  final List<Map<String, dynamic>> activeFilters;
  final Function(List<Map<String, dynamic>>) onApplyFilters;
  final VoidCallback onReset;

  const FilterBottomSheet({
    super.key,
    required this.activeFilters,
    required this.onApplyFilters,
    required this.onReset,
  });

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  // Price Range
  bool pr0 = false; // < 1L
  bool pr1 = false; // 1L - 3L
  bool pr2 = false; // 3L - 6L
  bool pr3 = false; // 6L+

  // Fuel Type
  bool ft1 = false; // Petrol
  bool ft2 = false; // Diesel
  bool ft3 = false; // CNG
  bool ft4 = false; // EV
  bool ft5 = false; // Hybrid

  // KM Driven
  bool mr1 = false; // 0-50k
  bool mr2 = false; // 50k-100k
  bool mr3 = false; // 100k+

  // Transmission
  bool tr1 = false; // Manual
  bool tr2 = false; // Automatic

  @override
  void initState() {
    super.initState();
    _initializeFromActiveFilters();
  }

  void _initializeFromActiveFilters() {
    for (var filter in widget.activeFilters) {
      if (filter['field'] == 'carStatus') continue;

      // Price filters
      if (filter['field'] == 'exceptedPrice') {
        if (filter['condition'] == '>=') {
          final value = filter['value'];
          if (value == 0) pr0 = true;
          if (value == 100000) pr1 = true;
          if (value == 300000) pr2 = true;
          if (value == 600000) pr3 = true;
        }
      }

      // Fuel type
      if (filter['field'] == 'fuelType') {
        final value = filter['value'];
        if (value is String) {
          if (value == 'Petrol') ft1 = true;
          if (value == 'Diesel') ft2 = true;
          if (value == 'CNG') ft3 = true;
          if (value == 'EV') ft4 = true;
          if (value == 'Hybrid') ft5 = true;
        } else if (value is List) {
          ft1 = value.contains('Petrol');
          ft2 = value.contains('Diesel');
          ft3 = value.contains('CNG');
          ft4 = value.contains('EV');
          ft5 = value.contains('Hybrid');
        }
      }

      // KM driven
      if (filter['field'] == 'km') {
        if (filter['condition'] == '>=') {
          final value = filter['value'];
          if (value == 0) mr1 = true;
          if (value == 50000) mr2 = true;
          if (value == 100000) mr3 = true;
        }
      }

      // Transmission
      if (filter['field'] == 'transmissionType') {
        final value = filter['value'];
        if (value is String) {
          if (value == 'Manual') tr1 = true;
          if (value == 'Automatic') tr2 = true;
        } else if (value is List) {
          tr1 = value.contains('Manual');
          tr2 = value.contains('Automatic');
        }
      }
    }
  }

  bool get _hasActiveFilters {
    return pr0 ||
        pr1 ||
        pr2 ||
        pr3 ||
        ft1 ||
        ft2 ||
        ft3 ||
        ft4 ||
        ft5 ||
        mr1 ||
        mr2 ||
        mr3 ||
        tr1 ||
        tr2;
  }

  void _applyFilters() {
    List<Map<String, dynamic>> filters = [
      {'field': 'carStatus', 'condition': '==', 'value': 'approved'},
    ];

    // Price Range filters
    List<List<int>> priceRanges = [];
    if (pr0) priceRanges.add([0, 100000]);
    if (pr1) priceRanges.add([100000, 300000]);
    if (pr2) priceRanges.add([300000, 600000]);
    if (pr3) priceRanges.add([600000, 999999999]);

    if (priceRanges.isNotEmpty) {
      int min = priceRanges.map((r) => r[0]).reduce((a, b) => a < b ? a : b);
      int max = priceRanges.map((r) => r[1]).reduce((a, b) => a > b ? a : b);
      filters.add({'field': 'exceptedPrice', 'condition': '>=', 'value': min});
      filters.add({'field': 'exceptedPrice', 'condition': '<=', 'value': max});
    }

    // Fuel Type filters
    List<String> fuelTypes = [];
    if (ft1) fuelTypes.add('Petrol');
    if (ft2) fuelTypes.add('Diesel');
    if (ft3) fuelTypes.add('CNG');
    if (ft4) fuelTypes.add('EV');
    if (ft5) fuelTypes.add('Hybrid');

    if (fuelTypes.isNotEmpty) {
      filters.add({
        'field': 'fuelType',
        'condition': fuelTypes.length == 1 ? '==' : 'in',
        'value': fuelTypes.length == 1 ? fuelTypes[0] : fuelTypes,
      });
    }

    // KM Driven filters
    List<List<int>> kmRanges = [];
    if (mr1) kmRanges.add([0, 50000]);
    if (mr2) kmRanges.add([50000, 100000]);
    if (mr3) kmRanges.add([100000, 1000000]);

    if (kmRanges.isNotEmpty) {
      int min = kmRanges.map((r) => r[0]).reduce((a, b) => a < b ? a : b);
      int max = kmRanges.map((r) => r[1]).reduce((a, b) => a > b ? a : b);
      filters.add({'field': 'km', 'condition': '>=', 'value': min});
      filters.add({'field': 'km', 'condition': '<=', 'value': max});
    }

    // Transmission Type filters
    List<String> transmissionTypes = [];
    if (tr1) transmissionTypes.add('Manual');
    if (tr2) transmissionTypes.add('Automatic');

    if (transmissionTypes.isNotEmpty) {
      filters.add({
        'field': 'transmissionType',
        'condition': transmissionTypes.length == 1 ? '==' : 'in',
        'value': transmissionTypes.length == 1
            ? transmissionTypes[0]
            : transmissionTypes,
      });
    }

    widget.onApplyFilters(filters);
    Navigator.pop(context);
  }

  void _resetFilters() {
    setState(() {
      pr0 = pr1 = pr2 = pr3 = false;
      ft1 = ft2 = ft3 = ft4 = ft5 = false;
      mr1 = mr2 = mr3 = false;
      tr1 = tr2 = false;
    });
    widget.onReset();
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
            ),
          ),
          child: Column(
            children: [
              // Header
              Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.accent1],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 16,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Filter',
                        style: AppTypography.h2Style(
                          color: AppColors.textLight,
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.close,
                            color: AppColors.textLight,
                            size: 20,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Content
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  children: [
                    _buildFilterSection('Price Range', [
                      _buildFilterChip('< 1L', pr0, () {
                        setState(() => pr0 = !pr0);
                      }),
                      _buildFilterChip('1L - 3L', pr1, () {
                        setState(() => pr1 = !pr1);
                      }),
                      _buildFilterChip('3L - 6L', pr2, () {
                        setState(() => pr2 = !pr2);
                      }),
                      _buildFilterChip('6L - ...', pr3, () {
                        setState(() => pr3 = !pr3);
                      }),
                    ]),
                    const SizedBox(height: 12),
                    _buildFilterSection('Fuel Type', [
                      _buildFilterChip('Petrol', ft1, () {
                        setState(() => ft1 = !ft1);
                      }),
                      _buildFilterChip('Diesel', ft2, () {
                        setState(() => ft2 = !ft2);
                      }),
                      _buildFilterChip('CNG', ft3, () {
                        setState(() => ft3 = !ft3);
                      }),
                      _buildFilterChip('EV', ft4, () {
                        setState(() => ft4 = !ft4);
                      }),
                      _buildFilterChip('Hybrid', ft5, () {
                        setState(() => ft5 = !ft5);
                      }),
                    ]),
                    const SizedBox(height: 12),
                    _buildFilterSection('KM Driven', [
                      _buildFilterChip('0 - 50k km', mr1, () {
                        setState(() => mr1 = !mr1);
                      }),
                      _buildFilterChip('50k - 100k km', mr2, () {
                        setState(() => mr2 = !mr2);
                      }),
                      _buildFilterChip('100k+ km', mr3, () {
                        setState(() => mr3 = !mr3);
                      }),
                    ]),
                    const SizedBox(height: 12),
                    _buildFilterSection('Transmission Type', [
                      _buildFilterChip('Manual', tr1, () {
                        setState(() => tr1 = !tr1);
                      }),
                      _buildFilterChip('Automatic', tr2, () {
                        setState(() => tr2 = !tr2);
                      }),
                    ]),
                  ],
                ),
              ),
              // Footer Buttons
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  border: Border(
                    top: BorderSide(color: AppColors.backgroundDark, width: 1),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 4,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _resetFilters,
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              side: const BorderSide(
                                color: AppColors.greyLight,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: Text(
                              'RESET',
                              style: AppTypography.subtitle2Style(
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: _hasActiveFilters
                                  ? const LinearGradient(
                                      colors: [
                                        AppColors.primary,
                                        AppColors.accent2,
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    )
                                  : null,
                              color: _hasActiveFilters
                                  ? null
                                  : AppColors.greyLight,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: ElevatedButton(
                              onPressed: _hasActiveFilters
                                  ? _applyFilters
                                  : null,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                shadowColor: Colors.transparent,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 16,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              child: Text(
                                'APPLY',
                                style: AppTypography.subtitle2Style(
                                  color: AppColors.textLight,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (_hasActiveFilters) ...[
                      const SizedBox(height: 12),
                      Text(
                        '${[pr0, pr1, pr2, pr3, ft1, ft2, ft3, ft4, ft5, mr1, mr2, mr3, tr1, tr2].where((f) => f).length} filters selected',
                        style: AppTypography.body2Style(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFilterSection(String title, List<Widget> chips) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.only(left: 10, top: 4, bottom: 4),
            decoration: const BoxDecoration(
              border: Border(
                left: BorderSide(color: AppColors.primary, width: 4),
              ),
            ),
            child: Text(
              title,
              style: AppTypography.subtitle2Style(color: AppColors.primary),
            ),
          ),
          const SizedBox(height: 6),
          Wrap(spacing: 8, runSpacing: 8, children: chips),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  colors: [AppColors.primary, AppColors.accent2],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isSelected ? null : AppColors.background,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? Colors.transparent : AppColors.greyLight,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 2,
                    offset: const Offset(0, 1),
                  ),
                ],
        ),
        child: Text(
          label,
          style: AppTypography.body2Style(
            color: isSelected ? AppColors.textLight : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }
}
