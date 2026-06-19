class PontoRecord {
  final int id;
  final DateTime clockIn;
  final DateTime? clockOut;
  final DateTime? breakStart;
  final DateTime? breakEnd;
  final String type;
  final String status;
  final String? facePhotoUrl;
  final double? latitude;
  final double? longitude;
  final double? matchPercent;
  final String? note;
  final DateTime createdAt;

  PontoRecord({
    required this.id,
    required this.clockIn,
    this.clockOut,
    this.breakStart,
    this.breakEnd,
    this.type = 'normal',
    this.status = 'pending',
    this.facePhotoUrl,
    this.latitude,
    this.longitude,
    this.matchPercent,
    this.note,
    required this.createdAt,
  });

  factory PontoRecord.fromJson(Map<String, dynamic> json) {
    return PontoRecord(
      id: json['id'] ?? 0,
      clockIn: DateTime.parse(json['clock_in'] ?? DateTime.now().toIso8601String()),
      clockOut: json['clock_out'] != null ? DateTime.parse(json['clock_out']) : null,
      breakStart: json['break_start'] != null ? DateTime.parse(json['break_start']) : null,
      breakEnd: json['break_end'] != null ? DateTime.parse(json['break_end']) : null,
      type: json['type'] ?? 'normal',
      status: json['status'] ?? 'pending',
      facePhotoUrl: json['face_photo_url'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      matchPercent: json['match_percent']?.toDouble(),
      note: json['note'],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  String get dateFormatted {
    return '${clockIn.day.toString().padLeft(2, '0')}/${clockIn.month.toString().padLeft(2, '0')}/${clockIn.year}';
  }

  String get clockInFormatted {
    return '${clockIn.hour.toString().padLeft(2, '0')}:${clockIn.minute.toString().padLeft(2, '0')}';
  }

  String get clockOutFormatted {
    return clockOut != null
        ? '${clockOut!.hour.toString().padLeft(2, '0')}:${clockOut!.minute.toString().padLeft(2, '0')}'
        : '---';
  }

  String get totalHours {
    if (clockOut == null) return 'Em andamento';
    final diff = clockOut!.difference(clockIn);
    final hours = diff.inHours;
    final minutes = diff.inMinutes.remainder(60);
    return '${hours}h ${minutes}min';
  }

  String get statusLabel {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      case 'auto_approved': return 'Aprovado Auto';
      default: return status;
    }
  }

  String get statusColor {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'gray';
    }
  }
}

class PontoSummary {
  final int totalDays;
  final double totalHours;
  final double overtimeHours;
  final double lateMinutes;
  final double absences;
  final String period;

  PontoSummary({
    this.totalDays = 0,
    this.totalHours = 0.0,
    this.overtimeHours = 0.0,
    this.lateMinutes = 0.0,
    this.absences = 0.0,
    this.period = '',
  });

  factory PontoSummary.fromJson(Map<String, dynamic> json) {
    return PontoSummary(
      totalDays: json['total_days'] ?? 0,
      totalHours: (json['total_hours'] ?? 0).toDouble(),
      overtimeHours: (json['overtime_hours'] ?? 0).toDouble(),
      lateMinutes: (json['late_minutes'] ?? 0).toDouble(),
      absences: (json['absences'] ?? 0).toDouble(),
      period: json['period'] ?? '',
    );
  }

  String get totalHoursFormatted => '${totalHours.toStringAsFixed(1)}h';
  String get overtimeFormatted => '${overtimeHours.toStringAsFixed(1)}h';
}
