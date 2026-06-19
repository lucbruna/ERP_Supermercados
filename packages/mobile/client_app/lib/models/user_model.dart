class UserModel {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String? avatarUrl;
  final String cpf;
  final DateTime? birthDate;
  final int fidelityPoints;
  final double cashbackBalance;
  final String? couponCode;
  final bool isMfaEnabled;
  final DateTime createdAt;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.avatarUrl,
    required this.cpf,
    this.birthDate,
    this.fidelityPoints = 0,
    this.cashbackBalance = 0.0,
    this.couponCode,
    this.isMfaEnabled = false,
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      avatarUrl: json['avatar_url'],
      cpf: json['cpf'] ?? '',
      birthDate: json['birth_date'] != null ? DateTime.parse(json['birth_date']) : null,
      fidelityPoints: json['fidelity_points'] ?? 0,
      cashbackBalance: (json['cashback_balance'] ?? 0.0).toDouble(),
      couponCode: json['coupon_code'],
      isMfaEnabled: json['is_mfa_enabled'] ?? false,
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'avatar_url': avatarUrl,
      'cpf': cpf,
      'birth_date': birthDate?.toIso8601String(),
      'fidelity_points': fidelityPoints,
      'cashback_balance': cashbackBalance,
      'coupon_code': couponCode,
      'is_mfa_enabled': isMfaEnabled,
      'created_at': createdAt.toIso8601String(),
    };
  }

  UserModel copyWith({
    int? id,
    String? name,
    String? email,
    String? phone,
    String? avatarUrl,
    String? cpf,
    DateTime? birthDate,
    int? fidelityPoints,
    double? cashbackBalance,
    String? couponCode,
    bool? isMfaEnabled,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      cpf: cpf ?? this.cpf,
      birthDate: birthDate ?? this.birthDate,
      fidelityPoints: fidelityPoints ?? this.fidelityPoints,
      cashbackBalance: cashbackBalance ?? this.cashbackBalance,
      couponCode: couponCode ?? this.couponCode,
      isMfaEnabled: isMfaEnabled ?? this.isMfaEnabled,
      createdAt: createdAt,
    );
  }

  String get maskedCpf {
    if (cpf.length != 11) return cpf;
    return '${cpf.substring(0, 3)}.***.***-${cpf.substring(9)}';
  }

  String get fidelityTier {
    if (fidelityPoints >= 5000) return 'Diamante';
    if (fidelityPoints >= 2000) return 'Ouro';
    if (fidelityPoints >= 1000) return 'Prata';
    if (fidelityPoints >= 500) return 'Bronze';
    return 'Básico';
  }

  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}
