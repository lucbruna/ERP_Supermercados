class NotificationModel {
  final int id;
  final String title;
  final String body;
  final String type;
  final String? imageUrl;
  final String? actionRoute;
  final bool isRead;
  final int? relatedId;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    this.imageUrl,
    this.actionRoute,
    this.isRead = false,
    this.relatedId,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      type: json['type'] ?? 'info',
      imageUrl: json['image_url'],
      actionRoute: json['action_route'],
      isRead: json['is_read'] ?? false,
      relatedId: json['related_id'],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  String get typeIcon {
    switch (type) {
      case 'offer':
        return 'local_offer';
      case 'promotion':
        return 'stars';
      case 'fidelity':
        return 'card_giftcard';
      case 'coupon':
        return 'confirmation_number';
      case 'order':
        return 'shopping_bag';
      case 'system':
        return 'info';
      default:
        return 'notifications';
    }
  }

  String get timeAgo {
    final diff = DateTime.now().difference(createdAt);
    if (diff.inDays > 0) return '${diff.inDays}d';
    if (diff.inHours > 0) return '${diff.inHours}h';
    if (diff.inMinutes > 0) return '${diff.inMinutes}min';
    return 'agora';
  }
}
