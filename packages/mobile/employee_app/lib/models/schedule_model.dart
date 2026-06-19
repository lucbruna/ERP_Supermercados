class ScheduleModel {
  final int id;
  final DateTime date;
  final String dayOfWeek;
  final String startTime;
  final String endTime;
  final String? breakStart;
  final String? breakEnd;
  final String type;
  final String status;
  final String? location;
  final String? note;

  ScheduleModel({
    required this.id,
    required this.date,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    this.breakStart,
    this.breakEnd,
    this.type = 'regular',
    this.status = 'scheduled',
    this.location,
    this.note,
  });

  factory ScheduleModel.fromJson(Map<String, dynamic> json) {
    return ScheduleModel(
      id: json['id'] ?? 0,
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      dayOfWeek: json['day_of_week'] ?? '',
      startTime: json['start_time'] ?? '08:00',
      endTime: json['end_time'] ?? '18:00',
      breakStart: json['break_start'],
      breakEnd: json['break_end'],
      type: json['type'] ?? 'regular',
      status: json['status'] ?? 'scheduled',
      location: json['location'],
      note: json['note'],
    );
  }

  String get timeRange => '$startTime - $endTime';

  String get statusLabel {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'absent': return 'Ausente';
      default: return status;
    }
  }

  double get totalHours {
    final startParts = startTime.split(':');
    final endParts = endTime.split(':');
    final startHour = int.tryParse(startParts[0]) ?? 0;
    final startMin = int.tryParse(startParts[1]) ?? 0;
    final endHour = int.tryParse(endParts[0]) ?? 0;
    final endMin = int.tryParse(endParts[1]) ?? 0;
    return (endHour - startHour) + (endMin - startMin) / 60.0;
  }

  String get dayLabel {
    switch (dayOfWeek) {
      case 'monday': return 'Seg';
      case 'tuesday': return 'Ter';
      case 'wednesday': return 'Qua';
      case 'thursday': return 'Qui';
      case 'friday': return 'Sex';
      case 'saturday': return 'Sáb';
      case 'sunday': return 'Dom';
      default: return dayOfWeek;
    }
  }
}
