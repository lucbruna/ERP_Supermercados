import 'package:flutter/material.dart';
import '../models/payroll_model.dart';
import '../services/payroll_service.dart';

class PayrollProvider extends ChangeNotifier {
  final PayrollService _payrollService = PayrollService();

  List<PayrollModel> _payrolls = [];
  PayrollModel? _selectedPayroll;
  bool _isLoading = false;
  String? _error;

  List<PayrollModel> get payrolls => _payrolls;
  PayrollModel? get selectedPayroll => _selectedPayroll;
  bool get isLoading => _isLoading;
  String? get error => _error;

  PayrollModel? get latestPayroll => _payrolls.isNotEmpty ? _payrolls.first : null;

  Future<void> loadPayrolls({int year = 2024}) async {
    _isLoading = true;
    notifyListeners();

    try {
      _payrolls = await _payrollService.getPayrollList(year: year);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadPayrollDetail(int payrollId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _selectedPayroll = await _payrollService.getPayrollDetail(payrollId);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<String> getPaystubUrl(int payrollId) async {
    try {
      return await _payrollService.getPaystubUrl(payrollId);
    } catch (e) {
      _error = e.toString();
      return '';
    }
  }

  Future<List<PayrollModel>> loadEmployeePayrolls(int employeeId, {int year = 2024}) async {
    try {
      return await _payrollService.getEmployeePayrolls(employeeId, year: year);
    } catch (e) {
      _error = e.toString();
      return [];
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
