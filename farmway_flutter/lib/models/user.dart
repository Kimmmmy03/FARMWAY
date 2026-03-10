class User {
  final String id;
  final String email;
  final String fullName;
  final String role;
  final bool isVerifiedSeller;
  final String preferredLang;
  final String? avatarS3Key;

  User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    required this.isVerifiedSeller,
    required this.preferredLang,
    this.avatarS3Key,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      fullName: json['full_name'],
      role: json['role'],
      isVerifiedSeller: json['is_verified_seller'] ?? false,
      preferredLang: json['preferred_lang'] ?? 'en',
      avatarS3Key: json['avatar_s3_key'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'full_name': fullName,
        'role': role,
        'is_verified_seller': isVerifiedSeller,
        'preferred_lang': preferredLang,
        'avatar_s3_key': avatarS3Key,
      };
}
