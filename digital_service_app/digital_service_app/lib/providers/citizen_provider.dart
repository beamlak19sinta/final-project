import 'package:flutter/material.dart';
import '../models/appointment_item.dart';
import '../models/helpdesk_note.dart';
import '../models/helpdesk_question.dart';
import '../models/notification_item.dart';
import '../models/online_request_item.dart';
import '../models/queue_ticket.dart';
import '../models/service_item.dart';
import '../models/service_sector.dart';
import '../services/api_service.dart';

class CitizenProvider extends ChangeNotifier {
  CitizenProvider(this._api);
  final ApiService _api;

  bool isLoading = false;
  String? error;

  List<ServiceSector> citizenSectors = [];
  List<ServiceSector> supportSectors = [];
  List<AppointmentItem> appointments = [];
  QueueTicket? activeQueue;
  List<QueueTicket> queueHistory = [];
  List<OnlineRequestItem> onlineRequests = [];
  List<HelpDeskNote> helpDeskNotes = [];
  List<HelpDeskQuestion> myIssues = [];
  List<NotificationItem> notifications = [];
  int unreadNotifications = 0;
  bool notificationsLoading = false;
  String? notificationsError;

  List<ServiceItem> get appointmentServices => citizenSectors
      .expand((s) => s.services.map((x) => ServiceItem.fromJson({'id': x.id, 'name': x.name, 'description': x.description, 'mode': x.mode, 'availability': x.availability, 'sectorName': s.name})))
      .where((s) => s.mode == 'APPOINTMENT')
      .toList();
  List<ServiceItem> get queueServices => citizenSectors
      .expand((s) => s.services.map((x) => ServiceItem.fromJson({'id': x.id, 'name': x.name, 'description': x.description, 'mode': x.mode, 'availability': x.availability, 'sectorName': s.name})))
      .where((s) => s.mode == 'QUEUE')
      .toList();
  List<ServiceItem> get onlineServices => supportSectors
      .expand((s) => s.services.map((x) => ServiceItem.fromJson({'id': x.id, 'name': x.name, 'description': x.description, 'mode': x.mode, 'availability': x.availability, 'sectorName': s.name})))
      .toList();

  Future<void> loadAll(String token) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _api.fetchCitizenServices(token: token),
        _api.fetchSupportServices(token: token),
        _api.getMyAppointments(token: token),
        _api.getQueueHistory(token: token),
        _api.getMyRequests(token: token),
        _api.fetchHelpDeskNotes(token: token),
        _api.getMyHelpDeskQuestions(token: token),
        _api.getNotifications(token: token),
      ]);
      citizenSectors = results[0] as List<ServiceSector>;
      supportSectors = results[1] as List<ServiceSector>;
      appointments = results[2] as List<AppointmentItem>;
      queueHistory = results[3] as List<QueueTicket>;
      onlineRequests = results[4] as List<OnlineRequestItem>;
      helpDeskNotes = results[5] as List<HelpDeskNote>;
      myIssues = results[6] as List<HelpDeskQuestion>;
      final notifResult = results[7] as ({List<NotificationItem> items, int unreadCount});
      notifications = notifResult.items;
      unreadNotifications = notifResult.unreadCount;
      activeQueue = await _api.getActiveQueue(token: token);
    } catch (e) {
      error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshQueueStatus(String token) async {
    try {
      activeQueue = await _api.getActiveQueue(token: token);
    } catch (e) {
      error = e.toString().replaceFirst('Exception: ', '');
    } finally {
      notifyListeners();
    }
  }

  Future<void> refreshNotifications(String token) async {
    notificationsLoading = true;
    notificationsError = null;
    notifyListeners();
    try {
      final result = await _api.getNotifications(token: token);
      notifications = result.items;
      unreadNotifications = result.unreadCount;
    } catch (e) {
      notificationsError = e.toString().replaceFirst('Exception: ', '');
    } finally {
      notificationsLoading = false;
      notifyListeners();
    }
  }

  Future<void> markNotificationAsRead({
    required String token,
    required String notificationId,
  }) async {
    try {
      await _api.markNotificationAsRead(token: token, notificationId: notificationId);
      notifications = notifications
          .map((item) => item.id == notificationId
              ? NotificationItem(
                  id: item.id,
                  title: item.title,
                  message: item.message,
                  type: item.type,
                  isRead: true,
                  createdAt: item.createdAt,
                  relatedId: item.relatedId,
                )
              : item)
          .toList();
      unreadNotifications = notifications.where((item) => !item.isRead).length;
    } catch (e) {
      notificationsError = e.toString().replaceFirst('Exception: ', '');
    } finally {
      notifyListeners();
    }
  }

  Future<void> markAllNotificationsAsRead(String token) async {
    try {
      await _api.markAllNotificationsAsRead(token: token);
      notifications = notifications
          .map((item) => NotificationItem(
                id: item.id,
                title: item.title,
                message: item.message,
                type: item.type,
                isRead: true,
                createdAt: item.createdAt,
                relatedId: item.relatedId,
              ))
          .toList();
      unreadNotifications = 0;
    } catch (e) {
      notificationsError = e.toString().replaceFirst('Exception: ', '');
    } finally {
      notifyListeners();
    }
  }
}
