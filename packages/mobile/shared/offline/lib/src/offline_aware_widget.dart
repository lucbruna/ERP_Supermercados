import 'dart:async';
import 'package:flutter/material.dart';
import 'connectivity_service.dart';
import 'sync_service.dart';

class OfflineAwareWidget extends StatefulWidget {
  final Widget child;
  final Widget? offlineChild;

  const OfflineAwareWidget({
    super.key,
    required this.child,
    this.offlineChild,
  });

  @override
  State<OfflineAwareWidget> createState() => _OfflineAwareWidgetState();
}

class _OfflineAwareWidgetState extends State<OfflineAwareWidget> {
  final ConnectivityService _connectivity = ConnectivityService();
  late StreamSubscription<bool> _sub;
  bool _isOnline = true;

  @override
  void initState() {
    super.initState();
    _isOnline = _connectivity.isOnline;
    _sub = _connectivity.onConnectivityChanged.listen((online) {
      if (mounted) setState(() => _isOnline = online);
    });
  }

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isOnline) return widget.child;
    return widget.offlineChild ?? Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.wifi_off, size: 64, color: Colors.grey[400]),
        const SizedBox(height: 16),
        Text(
          'Você está offline',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: Colors.grey[600],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Alterações serão sincronizadas quando conectar.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Colors.grey[500],
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class OfflineBanner extends StatefulWidget {
  const OfflineBanner({super.key});

  @override
  State<OfflineBanner> createState() => _OfflineBannerState();
}

class _OfflineBannerState extends State<OfflineBanner>
    with SingleTickerProviderStateMixin {
  final ConnectivityService _connectivity = ConnectivityService();
  late StreamSubscription<bool> _sub;
  bool _isOnline = true;
  late AnimationController _animController;
  late Animation<double> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _isOnline = _connectivity.isOnline;
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _slideAnimation = Tween<double>(begin: -1.0, end: 0.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );

    if (!_isOnline) _animController.forward();

    _sub = _connectivity.onConnectivityChanged.listen((online) {
      if (mounted) {
        setState(() => _isOnline = online);
        if (online) {
          _animController.reverse();
        } else {
          _animController.forward();
        }
      }
    });
  }

  @override
  void dispose() {
    _sub.cancel();
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _slideAnimation,
      builder: (context, child) {
        return FractionalTranslation(
          translation: Offset(0, _slideAnimation.value),
          child: child,
        );
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        color: _isOnline ? Colors.green[700] : Colors.amber[800],
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _isOnline ? Icons.wifi : Icons.wifi_off,
              color: Colors.white,
              size: 16,
            ),
            const SizedBox(width: 8),
            Text(
              _isOnline
                  ? 'Conectado'
                  : 'Você está offline. Alterações serão sincronizadas quando conectar.',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SyncStatusIndicator extends StatefulWidget {
  final bool showLabel;

  const SyncStatusIndicator({super.key, this.showLabel = false});

  @override
  State<SyncStatusIndicator> createState() => _SyncStatusIndicatorState();
}

class _SyncStatusIndicatorState extends State<SyncStatusIndicator> {
  final SyncService _syncService = SyncService();
  StreamSubscription<SyncStatus>? _sub;
  SyncStatus? _status;

  @override
  void initState() {
    super.initState();
    _sub = _syncService.onStatusChanged.listen((status) {
      if (mounted) setState(() => _status = status);
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final status = _status;
    if (status == null) return const SizedBox.shrink();

    Color dotColor;
    String tooltip;

    if (status.isSyncing) {
      dotColor = Colors.amber;
      tooltip = 'Sincronizando... (${status.pendingCount} pendentes)';
    } else if (!status.isOnline) {
      dotColor = Colors.red;
      tooltip = 'Offline - ${status.pendingCount} operações pendentes';
    } else if (status.pendingCount > 0) {
      dotColor = Colors.red;
      tooltip = '${status.pendingCount} operações aguardando sincronização';
    } else {
      dotColor = Colors.green;
      tooltip = 'Conectado';
    }

    return GestureDetector(
      onTap: () {
        if (status.pendingCount > 0 && status.isOnline) {
          _syncService.syncAll();
        }
      },
      child: Tooltip(
        message: tooltip,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: dotColor,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: dotColor.withOpacity(0.5),
                    blurRadius: 4,
                    spreadRadius: 1,
                  ),
                ],
              ),
            ),
            if (status.pendingCount > 0 && widget.showLabel) ...[
              const SizedBox(width: 4),
              Text(
                '${status.pendingCount}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
