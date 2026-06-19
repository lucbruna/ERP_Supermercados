import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class DeliveryMap extends StatelessWidget {
  final List<Map<String, dynamic>> route;
  final double originLat;
  final double originLng;

  const DeliveryMap({
    super.key,
    required this.route,
    required this.originLat,
    required this.originLng,
  });

  @override
  Widget build(BuildContext context) {
    final markers = <Marker>{};

    markers.add(Marker(
      markerId: const MarkerId('origin'),
      position: LatLng(originLat, originLng),
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      infoWindow: const InfoWindow(title: 'Origem'),
    ));

    for (var i = 0; i < route.length; i++) {
      final stop = route[i];
      final lat = (stop['latitude'] ?? stop['lat'] ?? 0).toDouble();
      final lng = (stop['longitude'] ?? stop['lng'] ?? 0).toDouble();
      if (lat != 0 && lng != 0) {
        markers.add(Marker(
          markerId: MarkerId('stop_$i'),
          position: LatLng(lat, lng),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
          infoWindow: InfoWindow(title: stop['customer_name'] ?? stop['cliente'] ?? 'Parada ${i + 1}'),
        ));
      }
    }

    final center = markers.isNotEmpty
        ? markers.first.position
        : const LatLng(-23.5505, -46.6333);

    return GoogleMap(
      initialCameraPosition: CameraPosition(target: center, zoom: 12),
      markers: markers,
      myLocationEnabled: true,
      myLocationButtonEnabled: true,
      compassEnabled: true,
      zoomControlsEnabled: true,
      onMapCreated: (controller) {},
    );
  }
}
