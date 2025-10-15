class User {
  final String uid;
  final String email;
  final String? name;
  final String? phoneNumber;
  final String? city;
  final String? state;
  final List<String> likedCars;
  final List<String> onSaleCars;
  final List<String> boughtCars;
  final List<String> soldCars;
  final DateTime? createdAt;

  User({
    required this.uid,
    required this.email,
    this.name,
    this.phoneNumber,
    this.city,
    this.state,
    List<String>? likedCars,
    List<String>? onSaleCars,
    List<String>? boughtCars,
    List<String>? soldCars,
    this.createdAt,
  }) : likedCars = likedCars ?? [],
       onSaleCars = onSaleCars ?? [],
       boughtCars = boughtCars ?? [],
       soldCars = soldCars ?? [];

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      uid: json['uid'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'],
      // Backend returns 'phone' but we store as 'phoneNumber'
      phoneNumber: json['phoneNumber'] ?? json['phone'],
      city: json['city'],
      state: json['state'],
      likedCars: List<String>.from(json['likedCars'] ?? []),
      onSaleCars: List<String>.from(json['onSaleCars'] ?? []),
      boughtCars: List<String>.from(json['boughtCars'] ?? []),
      soldCars: List<String>.from(json['soldCars'] ?? []),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'email': email,
      'name': name,
      'phoneNumber': phoneNumber,
      'city': city,
      'state': state,
      'likedCars': likedCars,
      'onSaleCars': onSaleCars,
      'boughtCars': boughtCars,
      'soldCars': soldCars,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  User copyWith({
    String? uid,
    String? email,
    String? name,
    String? phoneNumber,
    String? city,
    String? state,
    List<String>? likedCars,
    List<String>? onSaleCars,
    List<String>? boughtCars,
    List<String>? soldCars,
    DateTime? createdAt,
  }) {
    return User(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      name: name ?? this.name,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      city: city ?? this.city,
      state: state ?? this.state,
      likedCars: likedCars ?? this.likedCars,
      onSaleCars: onSaleCars ?? this.onSaleCars,
      boughtCars: boughtCars ?? this.boughtCars,
      soldCars: soldCars ?? this.soldCars,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
