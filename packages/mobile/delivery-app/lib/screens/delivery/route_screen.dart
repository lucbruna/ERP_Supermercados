import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../providers/route_provider.dart';
import '../../widgets/delivery_map.dart';

class RouteScreen extends StatefulWidget {
  const RouteScreen({super.key});

  @override
  State<RouteScreen> createState() => _RouteScreenState();
}

class _RouteScreenState extends State<RouteScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RouteProvider>().loadRoute();
    });
  }

  @override
  Widget build(BuildContext context) {
    final routeProvider = context.watch<RouteProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Rota Otimizada')),
      body: routeProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Expanded(
                  flex: 3,
                  child: DeliveryMap(
                    route: routeProvider.route,
                    originLat: routeProvider.originLat,
                    originLng: routeProvider.originLng,
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 16, offset: const Offset(0, -4))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Paradas (${routeProvider.route.length})', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                              TextButton.icon(
                                onPressed: () => routeProvider.loadRoute(),
                                icon: const Icon(Icons.refresh, size: 16),
                                label: const Text('Otimizar'),
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: ReorderableListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: routeProvider.route.length,
                            onReorder: (oldIndex, newIndex) => routeProvider.reorderRoute(oldIndex, newIndex),
                            itemBuilder: (_, i) {
                              final stop = routeProvider.route[i];
                              return Container(
                                key: ValueKey(stop['id'] ?? i),
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.grey[50],
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppTheme.divider.withOpacity(0.3)),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 28, height: 28,
                                      decoration: BoxDecoration(
                                        color: AppTheme.primary,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Center(
                                        child: Text('${i + 1}', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(stop['customer_name'] ?? stop['cliente'] ?? 'Parada ${i + 1}',
                                              style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500)),
                                          Text(stop['address'] ?? stop['endereco'] ?? '',
                                              style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
                                        ],
                                      ),
                                    ),
                                    Icon(Icons.drag_handle, color: AppTheme.textSecondary, size: 20),
                                  ],
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
