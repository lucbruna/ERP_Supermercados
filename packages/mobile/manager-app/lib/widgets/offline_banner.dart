import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:offline/offline.dart';

class ManagerOfflineBanner extends StatefulWidget {
  const ManagerOfflineBanner({super.key});

  @override
  State<ManagerOfflineBanner> createState() => _ManagerOfflineBannerState();
}

class _ManagerOfflineBannerState extends State<ManagerOfflineBanner> {
  final ConnectivityService _connectivity = ConnectivityService();
  late StreamSubscription<bool> _connectSub;
  bool _isOnline = true;

  @override
  void initState() {
    super.initState();
    _isOnline = _connectivity.isOnline;
    _connectSub = _connectivity.onConnectivityChanged.listen((online) {
      if (mounted) setState(() => _isOnline = online);
    });
  }

  @override
  void dispose() {
    _connectSub.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isOnline) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: Colors.red[800],
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.wifi_off, color: Colors.white, size: 18),
          const SizedBox(width: 8),
          Text(
            'Modo Offline - Dados podem estar desatualizados',
            style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
