import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:offline/offline.dart';
import '../config/theme.dart';
import '../services/offline_service.dart';

class ClientOfflineBanner extends StatefulWidget {
  const ClientOfflineBanner({super.key});

  @override
  State<ClientOfflineBanner> createState() => _ClientOfflineBannerState();
}

class _ClientOfflineBannerState extends State<ClientOfflineBanner>
    with SingleTickerProviderStateMixin {
  final ConnectivityService _connectivity = ConnectivityService();
  final SyncService _syncService = SyncService();
  late StreamSubscription<bool> _connectSub;
  late StreamSubscription<SyncStatus> _syncSub;
  late AnimationController _animController;

  bool _isOnline = true;
  bool _isSyncing = false;
  int _pendingCount = 0;

  @override
  void initState() {
    super.initState();
    _isOnline = _connectivity.isOnline;
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );

    if (!_isOnline) _animController.forward();

    _connectSub = _connectivity.onConnectivityChanged.listen((online) {
      if (mounted) {
        setState(() => _isOnline = online);
        if (online) {
          _animController.reverse();
        } else {
          _animController.forward();
        }
      }
    });

    _syncSub = _syncService.onStatusChanged.listen((status) {
      if (mounted) {
        setState(() {
          _isSyncing = status.isSyncing;
          _pendingCount = status.pendingCount;
        });
      }
    });
  }

  @override
  void dispose() {
    _connectSub.cancel();
    _syncSub.cancel();
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isOnline && _pendingCount == 0 && !_isSyncing) {
      return const SizedBox.shrink();
    }

    return AnimatedBuilder(
      animation: _animController,
      builder: (context, child) {
        return FractionalTranslation(
          translation: Offset(0, _animController.value == 0 && _isOnline && _pendingCount == 0 ? -1 : 0),
          child: child,
        );
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        color: _isSyncing
            ? Colors.blue[700]
            : _isOnline
                ? Colors.amber[800]
                : Colors.red[800],
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_isSyncing)
              const SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            else
              Icon(
                _isOnline ? Icons.sync_problem : Icons.wifi_off,
                color: Colors.white,
                size: 18,
              ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _isSyncing
                    ? 'Sincronizando... ($_pendingCount pendentes)'
                    : _isOnline
                        ? '$_pendingCount alterações aguardando sincronização'
                        : 'Modo Offline - $_pendingCount pendentes',
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            if (_isOnline && _pendingCount > 0)
              GestureDetector(
                onTap: () => _syncService.syncAll(),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'Sincronizar',
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
