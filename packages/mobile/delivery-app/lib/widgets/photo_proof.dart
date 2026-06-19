import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class PhotoProof extends StatefulWidget {
  const PhotoProof({super.key});

  @override
  State<PhotoProof> createState() => _PhotoProofState();
}

class _PhotoProofState extends State<PhotoProof> {
  String? _photoPath;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Foto de Comprovante', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Container(
          height: 160,
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.divider),
            image: _photoPath != null
                ? DecorationImage(image: FileImage(File(_photoPath!)), fit: BoxFit.cover)
                : null,
          ),
          child: _photoPath == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.camera_alt_outlined, size: 32, color: AppTheme.textSecondary),
                      const SizedBox(height: 8),
                      Text('Tirar foto do comprovante', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                    ],
                  ),
                )
              : null,
        ),
        if (_photoPath == null) ...[
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                setState(() => _photoPath = 'placeholder_path');
              },
              icon: const Icon(Icons.camera_alt, size: 18),
              label: const Text('Capturar Foto'),
            ),
          ),
        ],
      ],
    );
  }
}
