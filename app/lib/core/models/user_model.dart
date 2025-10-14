class User {
  final String uid;
  final String email;
  final String? name;
  final String? phoneNumber;
  final String? city;
  final String? state;
  final List<String> likedCars;
  final List<String> myCars;
  final DateTime? createdAt;

  User({
    required this.uid,
    required this.email,
    this.name,
    this.phoneNumber,
    this.city,
    this.state,
    List<String>? likedCars,
    List<String>? myCars,
    this.createdAt,
  }) : likedCars = likedCars ?? [],
       myCars = myCars ?? [];

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
      myCars: List<String>.from(json['myCars'] ?? []),
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
      'myCars': myCars,
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
    List<String>? myCars,
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
      myCars: myCars ?? this.myCars,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
