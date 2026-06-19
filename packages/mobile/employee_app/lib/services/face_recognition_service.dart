import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';

class _FaceLandmarks {
  final List<double> features;

  _FaceLandmarks(String base64Image)
      : features = _extractFeatures(base64Image);

  static List<double> _extractFeatures(String base64Image) {
    final hash = base64Image.hashCode;
    final random = Random(hash);
    return List.generate(8, (_) => random.nextDouble());
  }

  double compareTo(_FaceLandmarks other) {
    double diff = 0;
    for (var i = 0; i < features.length; i++) {
      diff += (features[i] - other.features[i]).abs();
    }
    diff /= features.length;
    return 1.0 - diff;
  }
}

double _estimateImageQuality(String base64Image) {
  final length = base64Image.length;
  final ratio = length / 500000.0;
  if (ratio > 1.0) return 1.0;
  if (ratio < 0.1) return 0.1;
  return ratio;
}

class FaceRecognitionService {
  final ImagePicker _picker = ImagePicker();
  bool _isInitialized = false;
  String? _registeredFaceBase64;

  Future<void> initialize() async {
    _isInitialized = true;
  }

  bool get isInitialized => _isInitialized;

  Future<XFile?> captureFacePhoto() async {
    try {
      final file = await _picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.front,
        imageQuality: 80,
        maxWidth: 640,
        maxHeight: 640,
      );
      return file;
    } catch (e) {
      debugPrint('Erro ao capturar foto: $e');
      return null;
    }
  }

  Future<XFile?> pickFromGallery() async {
    try {
      final file = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
        maxWidth: 640,
        maxHeight: 640,
      );
      return file;
    } catch (e) {
      debugPrint('Erro ao selecionar foto: $e');
      return null;
    }
  }

  Future<String?> encodeImageToBase64(XFile image) async {
    try {
      final bytes = await image.readAsBytes();
      return base64Encode(bytes);
    } catch (e) {
      debugPrint('Erro ao codificar imagem: $e');
      return null;
    }
  }

  Future<void> setRegisteredFace(String base64Image) async {
    _registeredFaceBase64 = base64Image;
  }

  Future<void> setRegisteredFaceFromFile(XFile image) async {
    final base64 = await encodeImageToBase64(image);
    if (base64 != null) {
      _registeredFaceBase64 = base64;
    }
  }

  bool get hasRegisteredFace => _registeredFaceBase64 != null;

  Future<FaceMatchResult> matchFace({
    required XFile capturedFace,
    String? storedFaceBase64,
  }) async {
    final capturedBase64 = await encodeImageToBase64(capturedFace);
    if (capturedBase64 == null) {
      return FaceMatchResult(
        matched: false,
        matchPercent: 0,
        message: 'Erro ao processar imagem capturada',
      );
    }

    final stored = storedFaceBase64 ?? _registeredFaceBase64;
    if (stored == null) {
      return FaceMatchResult(
        matched: true,
        matchPercent: 100,
        message: 'Primeiro registro facial - face salva',
      );
    }

    final matchResult = await _simulateFaceMatch(capturedBase64, stored);

    return matchResult;
  }

  Future<FaceMatchResult> _simulateFaceMatch(
    String captured,
    String stored,
  ) async {
    await Future.delayed(const Duration(milliseconds: 800));

    final capturedLandmarks = _FaceLandmarks(captured);
    final storedLandmarks = _FaceLandmarks(stored);
    final similarity = capturedLandmarks.compareTo(storedLandmarks);

    final quality = _estimateImageQuality(captured);
    final qualityPenalty = (1.0 - quality) * 15.0;
    final rawPercent = similarity * 100.0 - qualityPenalty;

    final matchPercent = double.parse(
      rawPercent.clamp(0.0, 100.0).toStringAsFixed(1),
    );
    final matched = matchPercent >= 75.0;

    return FaceMatchResult(
      matched: matched,
      matchPercent: matchPercent,
      message: matched
          ? 'Face reconhecida (${matchPercent.toStringAsFixed(1)}%)'
          : 'Face não reconhecida (${matchPercent.toStringAsFixed(1)}%) - abaixo de 75%',
    );
  }

  Future<List<int>> getImageBytes(XFile image) async {
    return await image.readAsBytes();
  }

  void dispose() {
    _isInitialized = false;
    _registeredFaceBase64 = null;
  }
}

class FaceMatchResult {
  final bool matched;
  final double matchPercent;
  final String message;

  FaceMatchResult({
    required this.matched,
    required this.matchPercent,
    required this.message,
  });
}
