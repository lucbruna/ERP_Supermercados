import 'package:local_auth/local_auth.dart';
import 'package:flutter/services.dart';

class BiometricService {
  final LocalAuthentication _localAuth = LocalAuthentication();
  bool _isAvailable = false;
  bool _isDeviceSupported = false;

  Future<void> initialize() async {
    try {
      _isDeviceSupported = await _localAuth.isDeviceSupported();
      _isAvailable = await _localAuth.canCheckBiometrics;
    } catch (e) {
      _isAvailable = false;
      _isDeviceSupported = false;
    }
  }

  bool get isAvailable => _isAvailable;
  bool get isDeviceSupported => _isDeviceSupported;

  Future<bool> get hasBiometrics async {
    try {
      return await _localAuth.canCheckBiometrics;
    } catch (e) {
      return false;
    }
  }

  Future<List<BiometricType>> get availableBiometrics async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } catch (e) {
      return [];
    }
  }

  Future<bool> authenticate({
    String reason = 'Autenticação necessária',
    String cancelButton = 'Cancelar',
    bool useErrorDialogs = true,
    bool stickyAuth = false,
  }) async {
    try {
      final authenticated = await _localAuth.authenticate(
        localizedReason: reason,
        options: AuthenticationOptions(
          useErrorDialogs: useErrorDialogs,
          stickyAuth: stickyAuth,
          biometricOnly: false,
        ),
      );
      return authenticated;
    } on PlatformException catch (e) {
      debugPrint('Erro de autenticação biométrica: ${e.message}');
      return false;
    }
  }

  Future<bool> authenticateWithBiometrics({
    String reason = 'Use sua digital para continuar',
  }) async {
    try {
      final authenticated = await _localAuth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          useErrorDialogs: true,
          stickyAuth: true,
          biometricOnly: true,
        ),
      );
      return authenticated;
    } on PlatformException catch (e) {
      debugPrint('Erro de biometria: ${e.message}');
      return false;
    }
  }

  Future<void> stopAuthentication() async {
    await _localAuth.stopAuthentication();
  }
}
