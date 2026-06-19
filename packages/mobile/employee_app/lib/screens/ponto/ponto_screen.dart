import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:offline/offline.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../providers/ponto_provider.dart';
import '../../services/face_recognition_service.dart';
import '../../services/biometric_service.dart';
import '../../widgets/face_capture_widget.dart';

enum BiometriaMetodo { DIGITAL, FACE, DUPLO }

class PontoScreen extends StatefulWidget {
  const PontoScreen({super.key});

  @override
  State<PontoScreen> createState() => _PontoScreenState();
}

class _PontoScreenState extends State<PontoScreen> {
  final FaceRecognitionService _faceService = FaceRecognitionService();
  final BiometricService _biometricService = BiometricService();
  final SyncService _syncService = SyncService();
  StreamSubscription<SyncStatus>? _syncSub;
  BiometriaMetodo _metodo = BiometriaMetodo.DUPLO;
  bool _digitalVerificada = false;
  String? _capturedImagePath;
  double? _matchPercent;
  bool _isProcessing = false;
  String? _statusMessage;
  bool _digitalDisponivel = false;
  bool _faceDisponivel = false;
  bool _isOffline = false;
  int _pendingCount = 0;

  @override
  void initState() {
    super.initState();
    _initialize();
    _syncSub = _syncService.onStatusChanged.listen((status) {
      if (mounted) {
        setState(() {
          _isOffline = !status.isOnline;
          _pendingCount = status.pendingCount;
        });
      }
    });
  }

  @override
  void dispose() {
    _syncSub?.cancel();
    super.dispose();
  }

  Future<void> _initialize() async {
    await _faceService.initialize();
    await _biometricService.initialize();
    final biometrias = await _biometricService.availableBiometrics;
    setState(() {
      _digitalDisponivel = biometrias.contains(BiometricType.fingerprint) || biometrias.contains(BiometricType.face);
      _faceDisponivel = true;
      if (!_digitalDisponivel && _faceDisponivel) _metodo = BiometriaMetodo.FACE;
      if (_digitalDisponivel && !_faceDisponivel) _metodo = BiometriaMetodo.DIGITAL;
    });
  }

  Future<bool> _verificarDigital() async {
    if (!_digitalDisponivel) return false;
    setState(() => _statusMessage = 'Posicione seu dedo no sensor...');
    final authenticated = await _biometricService.authenticate(
      reason: 'Autentique com sua digital para bater o ponto',
    );
    if (authenticated) {
      setState(() => _digitalVerificada = true);
    }
    return authenticated;
  }

  Future<bool> _verificarFace() async {
    if (!_faceDisponivel) return false;
    setState(() => _statusMessage = 'Posicione o rosto para captura...');
    final photo = await _faceService.captureFacePhoto();
    if (photo == null) return false;

    setState(() {
      _capturedImagePath = photo.path;
      _statusMessage = 'Verificando face...';
    });

    final match = await _faceService.matchFace(capturedFace: photo);
    _matchPercent = match.matchPercent;

    if (!match.matched) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(match.message), backgroundColor: AppTheme.error),
        );
      }
      return false;
    }
    return true;
  }

  Future<void> _handlePonto() async {
    setState(() {
      _isProcessing = true;
      _digitalVerificada = false;
      _capturedImagePath = null;
      _matchPercent = null;
      _statusMessage = 'Iniciando registro de ponto...';
    });

    if (_metodo == BiometriaMetodo.DIGITAL || _metodo == BiometriaMetodo.DUPLO) {
      final ok = await _verificarDigital();
      if (!ok) {
        setState(() {
          _isProcessing = false;
          _statusMessage = 'Falha na autenticação por digital';
        });
        return;
      }
    }

    if (_metodo == BiometriaMetodo.FACE || _metodo == BiometriaMetodo.DUPLO) {
      final ok = await _verificarFace();
      if (!ok) {
        setState(() {
          _isProcessing = false;
          _statusMessage = 'Falha no reconhecimento facial';
        });
        return;
      }
    }

    final pontoProvider = context.read<PontoProvider>();
    final capturedBase64 = _capturedImagePath != null
        ? await _faceService.encodeImageToBase64(XFile(_capturedImagePath!))
        : null;

    bool success;
    if (pontoProvider.isClockedIn) {
      success = await pontoProvider.clockOut(
        facePhotoBase64: capturedBase64,
        matchPercent: _matchPercent,
        biometrico: true,
      );
    } else {
      success = await pontoProvider.clockIn(
        facePhotoBase64: capturedBase64,
        matchPercent: _matchPercent,
        biometrico: true,
      );
    }

    setState(() {
      _isProcessing = false;
      _statusMessage = success ? 'Ponto registrado com sucesso!' : 'Erro ao registrar ponto';
    });

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ponto registrado com sucesso!'), backgroundColor: AppTheme.success),
      );
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(pontoProvider.error ?? 'Erro ao registrar ponto'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  String _getMetodoLabel() {
    switch (_metodo) {
      case BiometriaMetodo.DIGITAL: return 'Digital';
      case BiometriaMetodo.FACE: return 'Reconhecimento Facial';
      case BiometriaMetodo.DUPLO: return 'Digital + Facial (Dupla Autenticação)';
    }
  }

  IconData _getMetodoIcon() {
    switch (_metodo) {
      case BiometriaMetodo.DIGITAL: return Icons.fingerprint;
      case BiometriaMetodo.FACE: return Icons.face;
      case BiometriaMetodo.DUPLO: return Icons.security;
    }
  }

  @override
  Widget build(BuildContext context) {
    final ponto = context.watch<PontoProvider>();
    final size = MediaQuery.of(context).size;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Registrar Ponto'),
            if (_isOffline || _pendingCount > 0) ...[
              const SizedBox(width: 8),
              SyncStatusIndicator(),
            ],
          ],
        ),
        actions: [
          if (_isOffline)
            Padding(
              padding: const EdgeInsets.only(right: 4),
              child: Icon(Icons.wifi_off, color: Colors.amber[300], size: 20),
            ),
          PopupMenuButton<BiometriaMetodo>(
            icon: const Icon(Icons.more_vert),
            onSelected: (m) => setState(() => _metodo = m),
            offset: const Offset(0, 40),
            itemBuilder: (_) => [
              if (_digitalDisponivel)
                const PopupMenuItem(value: BiometriaMetodo.DIGITAL, child: Text('Apenas Digital')),
              if (_faceDisponivel)
                const PopupMenuItem(value: BiometriaMetodo.FACE, child: Text('Apenas Facial')),
              if (_digitalDisponivel && _faceDisponivel)
                const PopupMenuItem(value: BiometriaMetodo.DUPLO, child: Text('Digital + Facial')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          if (_isOffline)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: Colors.amber[800],
              child: Row(
                children: [
                  const Icon(Icons.wifi_off, color: Colors.white, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Modo Offline - Ponto será sincronizado automaticamente',
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 12),
                    ),
                  ),
                  if (_pendingCount > 0)
                    Text(
                      '$_pendingCount pendentes',
                      style: GoogleFonts.inter(color: Colors.white70, fontSize: 12),
                    ),
                ],
              ),
            ),
          Expanded(
            child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              SizedBox(height: size.height * 0.02),
              Chip(
                avatar: Icon(_getMetodoIcon(), size: 18),
                label: Text(_getMetodoLabel()),
                backgroundColor: AppTheme.primaryGreen.withOpacity(0.1),
              ),
              SizedBox(height: size.height * 0.02),
              Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _digitalVerificada || _capturedImagePath != null
                      ? AppTheme.success.withOpacity(0.1)
                      : ponto.isClockedIn ? AppTheme.clockIn.withOpacity(0.1) : AppTheme.primaryGreen.withOpacity(0.1),
                  border: Border.all(
                    color: _digitalVerificada || _capturedImagePath != null
                        ? AppTheme.success
                        : ponto.isClockedIn ? AppTheme.clockIn : AppTheme.primaryGreen,
                    width: 4,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: (_digitalVerificada || _capturedImagePath != null
                          ? AppTheme.success
                          : ponto.isClockedIn ? AppTheme.clockIn : AppTheme.primaryGreen).withOpacity(0.2),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_digitalVerificada && _capturedImagePath == null)
                      const Icon(Icons.fingerprint, size: 48, color: AppTheme.success),
                    if (_capturedImagePath != null && _matchPercent != null && _matchPercent! >= 75)
                      const Icon(Icons.face, size: 48, color: AppTheme.success),
                    if (_digitalVerificada && _capturedImagePath != null)
                      const Icon(Icons.security, size: 48, color: AppTheme.success),
                    if (!_digitalVerificada && _capturedImagePath == null)
                      Icon(
                        ponto.isClockedIn ? Icons.logout : Icons.login,
                        size: 48,
                        color: ponto.isClockedIn ? AppTheme.clockIn : AppTheme.primaryGreen,
                      ),
                    const SizedBox(height: 4),
                    Text(
                      _getTimeNow(),
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: size.height * 0.03),
              Text(
                ponto.isClockedIn ? 'Registrar Saída' : 'Registrar Entrada',
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                ponto.isClockedIn
                    ? 'Confirme para encerrar seu expediente'
                    : 'Confirme para iniciar seu expediente',
                style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary),
              ),
              SizedBox(height: size.height * 0.03),
              if (_capturedImagePath != null)
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: _matchPercent != null && _matchPercent! >= 75 ? AppTheme.success : AppTheme.error, width: 2),
                    image: DecorationImage(
                      image: FileImage(File(_capturedImagePath!)),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              if (_matchPercent != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    'Match: ${_matchPercent!.toStringAsFixed(1)}%',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _matchPercent! >= 75 ? AppTheme.success : AppTheme.error,
                    ),
                  ),
                ),
              if (_digitalVerificada)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.check_circle, color: AppTheme.success, size: 18),
                      const SizedBox(width: 6),
                      Text('Digital verificada',
                          style: GoogleFonts.inter(fontSize: 14, color: AppTheme.success)),
                    ],
                  ),
                ),
              if (_statusMessage != null && _isProcessing)
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(width: 20, height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2)),
                      const SizedBox(width: 12),
                      Text(_statusMessage!,
                          style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
                    ],
                  ),
                ),
              SizedBox(height: size.height * 0.03),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: (_isProcessing || (!_digitalDisponivel && !_faceDisponivel)) ? null : _handlePonto,
                  icon: Icon(
                    _metodo == BiometriaMetodo.DIGITAL ? Icons.fingerprint :
                    _metodo == BiometriaMetodo.FACE ? Icons.face : Icons.security,
                    size: 24,
                  ),
                  label: Text(
                    _metodo == BiometriaMetodo.DIGITAL ? 'Bater Ponto (Digital)' :
                    _metodo == BiometriaMetodo.FACE ? 'Bater Ponto (Facial)' : 'Bater Ponto (Digital + Facial)',
                    style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ponto.isClockedIn ? AppTheme.clockOut : AppTheme.primaryGreen,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),
              if (!_digitalDisponivel && !_faceDisponivel)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text('Nenhum método biométrico disponível neste dispositivo',
                      style: GoogleFonts.inter(fontSize: 12, color: AppTheme.error)),
                ),
            ],
          ),
        ),
      ],
    ),
  );
  }

  String _getTimeNow() {
    final now = DateTime.now();
    return '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
  }
}
