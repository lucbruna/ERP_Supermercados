class EmployeeModel {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String? avatarUrl;
  final String cpf;
  final String role;
  final String department;
  final String position;
  final String? registrationNumber;
  final DateTime? hireDate;
  final double salary;
  final String workShift;
  final String? facePhotoUrl;
  final bool isRh;
  final bool isActive;
  final DateTime createdAt;

  EmployeeModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.avatarUrl,
    required this.cpf,
    required this.role,
    required this.department,
    required this.position,
    this.registrationNumber,
    this.hireDate,
    this.salary = 0.0,
    this.workShift = 'comercial',
    this.facePhotoUrl,
    this.isRh = false,
    this.isActive = true,
    required this.createdAt,
  });

  factory EmployeeModel.fromJson(Map<String, dynamic> json) {
    return EmployeeModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      avatarUrl: json['avatar_url'],
      cpf: json['cpf'] ?? '',
      role: json['role'] ?? 'employee',
      department: json['department'] ?? '',
      position: json['position'] ?? '',
      registrationNumber: json['registration_number'],
      hireDate: json['hire_date'] != null ? DateTime.parse(json['hire_date']) : null,
      salary: (json['salary'] ?? 0).toDouble(),
      workShift: json['work_shift'] ?? 'comercial',
      facePhotoUrl: json['face_photo_url'],
      isRh: json['is_rh'] ?? false,
      isActive: json['is_active'] ?? true,
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
      'role': role,
      'department': department,
      'position': position,
      'registration_number': registrationNumber,
      'hire_date': hireDate?.toIso8601String(),
      'salary': salary,
      'work_shift': workShift,
      'face_photo_url': facePhotoUrl,
      'is_rh': isRh,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
    };
  }

  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }

  String get maskedCpf {
    if (cpf.length != 11) return cpf;
    return '${cpf.substring(0, 3)}.***.***-${cpf.substring(9)}';
  }

  String get hireDateFormatted {
    if (hireDate == null) return '';
    return '${hireDate!.day}/${hireDate!.month}/${hireDate!.year}';
  }
}
