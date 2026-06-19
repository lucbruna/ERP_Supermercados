import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../config/api_config.dart';
import '../models/notification_model.dart';
import 'api_service.dart';

class NotificationService {
  final ApiService _api = ApiService();
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (details) {
        debugPrint('Notification tapped: ${details.payload}');
      },
    );
    _initialized = true;
  }

  Future<void> showLocalNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'erp_channel',
      'ERP Supermercado',
      channelDescription: 'Notificações do ERP Supermercado',
      importance: Importance.high,
      priority: Priority.high,
    );
    const iosDetails = DarwinNotificationDetails();
    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    await _localNotifications.show(id, title, body, details, payload: payload);
  }

  Future<List<NotificationModel>> getNotifications({int page = 1}) async {
    final data = await _api.get(ApiConfig.notificationsEndpoint, queryParams: {
      'page': page.toString(),
    });
    return (data['notifications'] as List<dynamic>)
        .map((e) => NotificationModel.fromJson(e))
        .toList();
  }

  Future<int> getUnreadCount() async {
    try {
      final data = await _api.get('${ApiConfig.notificationsEndpoint}/unread-count');
      return data['count'] ?? 0;
    } catch (_) {
      return 0;
    }
  }

  Future<void> markAsRead(int notificationId) async {
    await _api.put('${ApiConfig.notificationsEndpoint}/$notificationId/read');
  }

  Future<void> markAllAsRead() async {
    await _api.put('${ApiConfig.notificationsEndpoint}/read-all');
  }

  Future<void> deleteNotification(int notificationId) async {
    await _api.delete('${ApiConfig.notificationsEndpoint}/$notificationId');
  }

  Future<void> registerFcmToken(String token) async {
    await _api.post('/push/register', body: {'token': token});
  }

  Future<void> unregisterFcmToken() async {
    await _api.post('/push/unregister');
  }
}
