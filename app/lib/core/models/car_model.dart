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
    return Car(
      id: json['id'] ?? '',
      carBrand: json['carBrand'] ?? '',
      carModel: json['carModel'] ?? '',
      carStatus: json['carStatus'],
      exceptedPrice: (json['exceptedPrice'] ?? 0).toDouble(),
      registrationNumber: json['registrationNumber'] ?? '',
      transmissionType: json['transmissionType'] ?? '',
      fuelType: json['fuelType'] ?? '',
      kilometerDriven: json['kilometerDriven'] ?? 0,
      ownerChange: json['ownerChange'] ?? 0,
      color: json['color'] ?? '',
      manufacturingYear: json['manufacturingYear'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      sellerUid: json['sellerUid'] ?? '',
      location: json['location'],
      description: json['description'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
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
