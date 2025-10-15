class Car {
  final String id;
  final String carBrand;
  final String carModel;
  final String? carStatus;
  final double exceptedPrice;
  final String registrationNumber;
  final String transmissionType;
  final String fuelType;
  final int kilometerDriven;
  final int ownerChange;
  final String color;
  final String manufacturingYear;
  final List<String> images;
  final String sellerUid;
  final String? location;
  final String? description;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Car({
    required this.id,
    required this.carBrand,
    required this.carModel,
    this.carStatus,
    required this.exceptedPrice,
    required this.registrationNumber,
    required this.transmissionType,
    required this.fuelType,
    required this.kilometerDriven,
    required this.ownerChange,
    required this.color,
    required this.manufacturingYear,
    required this.images,
    required this.sellerUid,
    this.location,
    this.description,
    this.createdAt,
    this.updatedAt,
  });

  factory Car.fromJson(Map<String, dynamic> json) {
    // Helper function to safely parse integers
    int _parseInt(dynamic value) {
      if (value == null) return 0;
      if (value is int) return value;
      if (value is double) return value.toInt();
      if (value is String) {
        return int.tryParse(value) ?? 0;
      }
      return 0;
    }

    // Helper function to safely parse doubles
    double _parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is double) return value;
      if (value is int) return value.toDouble();
      if (value is String) {
        return double.tryParse(value) ?? 0.0;
      }
      return 0.0;
    }

    return Car(
      id: json['id']?.toString() ?? '',
      carBrand: json['carBrand']?.toString() ?? '',
      carModel: json['carModel']?.toString() ?? '',
      carStatus: json['carStatus']?.toString(),
      exceptedPrice: _parseDouble(json['exceptedPrice']),
      registrationNumber: json['registrationNumber']?.toString() ?? '',
      transmissionType: json['transmissionType']?.toString() ?? '',
      fuelType: json['fuelType']?.toString() ?? '',
      kilometerDriven: _parseInt(json['km'] ?? json['kilometerDriven']),
      ownerChange: _parseInt(json['ownerNumber'] ?? json['ownerChange']),
      color: json['color']?.toString() ?? '',
      manufacturingYear:
          json['modelYear']?.toString() ??
          json['manufacturingYear']?.toString() ??
          '',
      images: json['images'] != null
          ? List<String>.from(json['images'].map((e) => e.toString()))
          : [],
      sellerUid:
          json['postedBy']?.toString() ?? json['sellerUid']?.toString() ?? '',
      location: json['location']?.toString(),
      description: json['description']?.toString(),
      createdAt: json['postedDate'] != null
          ? DateTime.tryParse(json['postedDate'].toString())
          : (json['createdAt'] != null
                ? DateTime.tryParse(json['createdAt'].toString())
                : null),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'carBrand': carBrand,
      'carModel': carModel,
      'carStatus': carStatus,
      'exceptedPrice': exceptedPrice,
      'registrationNumber': registrationNumber,
      'transmissionType': transmissionType,
      'fuelType': fuelType,
      'kilometerDriven': kilometerDriven,
      'ownerChange': ownerChange,
      'color': color,
      'manufacturingYear': manufacturingYear,
      'images': images,
      'sellerUid': sellerUid,
      'location': location,
      'description': description,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}
