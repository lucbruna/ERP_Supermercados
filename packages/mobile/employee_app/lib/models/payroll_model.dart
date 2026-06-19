class PayrollModel {
  final int id;
  final String reference;
  final DateTime paymentDate;
  final double grossSalary;
  final double deductions;
  final double netSalary;
  final double? overtimeValue;
  final double? benefits;
  final double? bonus;
  final double? inss;
  final double? irrf;
  final double? fgts;
  final String status;
  final String? paystubUrl;
  final String? bankAccount;

  PayrollModel({
    required this.id,
    required this.reference,
    required this.paymentDate,
    required this.grossSalary,
    this.deductions = 0.0,
    required this.netSalary,
    this.overtimeValue,
    this.benefits,
    this.bonus,
    this.inss,
    this.irrf,
    this.fgts,
    this.status = 'pending',
    this.paystubUrl,
    this.bankAccount,
  });

  factory PayrollModel.fromJson(Map<String, dynamic> json) {
    return PayrollModel(
      id: json['id'] ?? 0,
      reference: json['reference'] ?? '',
      paymentDate: DateTime.parse(json['payment_date'] ?? DateTime.now().toIso8601String()),
      grossSalary: (json['gross_salary'] ?? 0).toDouble(),
      deductions: (json['deductions'] ?? 0).toDouble(),
      netSalary: (json['net_salary'] ?? 0).toDouble(),
      overtimeValue: json['overtime_value']?.toDouble(),
      benefits: json['benefits']?.toDouble(),
      bonus: json['bonus']?.toDouble(),
      inss: json['inss']?.toDouble(),
      irrf: json['irrf']?.toDouble(),
      fgts: json['fgts']?.toDouble(),
      status: json['status'] ?? 'pending',
      paystubUrl: json['paystub_url'],
      bankAccount: json['bank_account'],
    );
  }

  String get formattedGross => 'R\$ ${grossSalary.toStringAsFixed(2)}';
  String get formattedNet => 'R\$ ${netSalary.toStringAsFixed(2)}';
  String get formattedDeductions => 'R\$ ${deductions.toStringAsFixed(2)}';

  String get statusLabel {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }
}
