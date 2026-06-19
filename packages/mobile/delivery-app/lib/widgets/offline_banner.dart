import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:offline/offline.dart';

class OfflineBanner extends StatelessWidget {
  final int pendingCount;
  final SyncService syncService;

  const OfflineBanner({super.key, required this.pendingCount, required this.syncService});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: Colors.red[800],
      child: Row(
        children: [
          const Icon(Icons.wifi_off, color: Colors.white, size: 16),
          const SizedBox(width: 8),
          Text(
            'Modo Offline - $pendingCount pendentes',
            style: GoogleFonts.inter(color: Colors.white, fontSize: 12),
          ),
          const Spacer(),
          if (pendingCount > 0)
            GestureDetector(
              onTap: () => syncService.syncAll(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text('Sincronizar', style: GoogleFonts.inter(color: Colors.white, fontSize: 11)),
              ),
            ),
        ],
      ),
    );
  }
}
