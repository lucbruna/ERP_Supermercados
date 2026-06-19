class RequestModel {
  final int id;
  final String type;
  final String title;
  final String description;
  final DateTime startDate;
  final DateTime? endDate;
  final String status;
  final String? reason;
  final String? attachmentUrl;
  final DateTime createdAt;
  final String? reviewedBy;
  final DateTime? reviewedAt;

  RequestModel({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.startDate,
    this.endDate,
    this.status = 'pending',
    this.reason,
    this.attachmentUrl,
    required this.createdAt,
    this.reviewedBy,
    this.reviewedAt,
  });

  factory RequestModel.fromJson(Map<String, dynamic> json) {
    return RequestModel(
      id: json['id'] ?? 0,
      type: json['type'] ?? 'vacation',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      startDate: DateTime.parse(json['start_date'] ?? DateTime.now().toIso8601String()),
      endDate: json['end_date'] != null ? DateTime.parse(json['end_date']) : null,
      status: json['status'] ?? 'pending',
      reason: json['reason'],
      attachmentUrl: json['attachment_url'],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      reviewedBy: json['reviewed_by'],
      reviewedAt: json['reviewed_at'] != null ? DateTime.parse(json['reviewed_at']) : null,
    );
  }

  String get typeLabel {
    switch (type) {
      case 'vacation': return 'Férias';
      case 'time_off': return 'Folga';
      case 'medical': return 'Atestado Médico';
      case 'personal': return 'Assunto Pessoal';
      case 'overtime': return 'Hora Extra';
      case 'benefit': return 'Benefício';
      case 'other': return 'Outro';
      default: return type;
    }
  }

  String get typeIcon {
    switch (type) {
      case 'vacation': return 'beach_access';
      case 'time_off': return 'free_breakfast';
      case 'medical': return 'local_hospital';
      case 'personal': return 'person';
      case 'overtime': return 'timer';
      case 'benefit': return 'card_giftcard';
      default: return 'description';
    }
  }

  String get statusLabel {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  String get periodFormatted {
    if (endDate == null) return startDate.toIso8601String().split('T')[0];
    return '${startDate.toIso8601String().split('T')[0]} até ${endDate!.toIso8601String().split('T')[0]}';
  }
}
