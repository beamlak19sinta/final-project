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

  // Cached, pre-processed service lists (prevents rebuilding and re-mapping on
  // every widget rebuild).
  List<ServiceItem> _appointmentServicesCache = const [];
  List<ServiceItem> _queueServicesCache = const [];
  List<ServiceItem> _onlineServicesCache = const [];
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

  List<ServiceItem> get appointmentServices => _appointmentServicesCache;
  List<ServiceItem> get queueServices => _queueServicesCache;
  List<ServiceItem> get onlineServices => _onlineServicesCache;

  void _rebuildServiceCaches() {
    String queueId = '';
    String appointmentId = '';
    String onlineId = '';

    for (final sector in citizenSectors) {
      for (final service in sector.services) {
        if (service.mode == 'QUEUE' && queueId.isEmpty) {
          queueId = service.id;
        }
        if (service.mode == 'APPOINTMENT' && appointmentId.isEmpty) {
          appointmentId = service.id;
        }
        if (service.mode == 'ONLINE' && onlineId.isEmpty) {
          onlineId = service.id;
        }
      }
    }

    for (final sector in supportSectors) {
      for (final service in sector.services) {
        if (service.mode == 'QUEUE' && queueId.isEmpty) {
          queueId = service.id;
        }
        if (service.mode == 'APPOINTMENT' && appointmentId.isEmpty) {
          appointmentId = service.id;
        }
        if (service.mode == 'ONLINE' && onlineId.isEmpty) {
          onlineId = service.id;
        }
      }
    }

    if (queueId.isEmpty) queueId = 'fallback-queue-id';
    if (appointmentId.isEmpty) appointmentId = 'fallback-appointment-id';
    if (onlineId.isEmpty) onlineId = 'fallback-online-id';

    final civilStatusServices = [
      ServiceItem(id: queueId, name: 'National Digital ID Registration', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Register for a new digital national identity card.', sectorName: 'Civil Status Services'),
      ServiceItem(id: queueId, name: 'National Digital ID Renewal', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Renew an expired national digital identity card.', sectorName: 'Civil Status Services'),
      ServiceItem(id: queueId, name: 'Lost National ID Replacement', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Request replacement for a lost or damaged identity card.', sectorName: 'Civil Status Services'),
      ServiceItem(id: queueId, name: 'Kebele Household Registration', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Queue for family household member registration.', sectorName: 'Civil Status Services'),
      ServiceItem(id: queueId, name: 'Resident ID Verification', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Verify local residential identity records.', sectorName: 'Civil Status Services'),
      ServiceItem(id: queueId, name: 'Civil Registration Record Verification', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Verify civil status, birth, or marriage registration records.', sectorName: 'Civil Status Services'),
      ServiceItem(id: appointmentId, name: 'Birth Certificate Request', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Schedule birth certificate verification and printing.', sectorName: 'Civil Status Services'),
      ServiceItem(id: appointmentId, name: 'Death Certificate Request', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Schedule death certificate verification and registration.', sectorName: 'Civil Status Services'),
      ServiceItem(id: appointmentId, name: 'Boundary Verification Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Book surveyor appointment for boundary check.', sectorName: 'Civil Status Services'),
      ServiceItem(id: appointmentId, name: 'Agricultural Land Certification Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Book appointment for agricultural land registration.', sectorName: 'Civil Status Services'),
      ServiceItem(id: onlineId, name: 'Request Document Correction', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Request corrections to official birth/marriage certificates.', sectorName: 'Civil Status Services'),
      ServiceItem(id: onlineId, name: 'Land Information Inquiry Portal', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Inquire about land registers, zoning, and plots.', sectorName: 'Civil Status Services'),
    ];

    final immigrationServices = [
      ServiceItem(id: appointmentId, name: 'Passport Document Verification', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Verify original documents for passport registration.', sectorName: 'Immigration and Nationality'),
      ServiceItem(id: appointmentId, name: 'Immigration Interview Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Required interview for residency or travel permits.', sectorName: 'Immigration and Nationality'),
    ];

    final transportServices = [
      ServiceItem(id: queueId, name: 'Vehicle Ownership Transfer', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Queue for registering vehicle purchase and transfer.', sectorName: 'Transport and Logistics'),
      ServiceItem(id: queueId, name: 'Driving License Renewal', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Queue for renewal or replacement of driver license.', sectorName: 'Transport and Logistics'),
    ];

    final taxServices = [
      ServiceItem(id: queueId, name: 'TIN Number Registration', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Register and obtain Tax Identification Number.', sectorName: 'Revenue and Tax'),
      ServiceItem(id: appointmentId, name: 'Tax Clearance Collection Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Collect official annual tax clearance statement.', sectorName: 'Revenue and Tax'),
      ServiceItem(id: appointmentId, name: 'Revenue Service Consultation', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Formal consulting with tax officers.', sectorName: 'Revenue and Tax'),
      ServiceItem(id: appointmentId, name: 'Property Valuation Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Property valuation and assessment session.', sectorName: 'Revenue and Tax'),
      ServiceItem(id: onlineId, name: 'Tax Record Summary Inquiry', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Retrieve tax statement records and payments.', sectorName: 'Revenue and Tax'),
    ];

    final businessServices = [
      ServiceItem(id: queueId, name: 'Business License Renewal', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Queue for annual renewal of commercial licenses.', sectorName: 'Business and Trade'),
      ServiceItem(id: appointmentId, name: 'Urban Planning Approval Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Plan review for construction permits.', sectorName: 'Business and Trade'),
      ServiceItem(id: appointmentId, name: 'Investment License Consultation', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Consult with investment board specialists.', sectorName: 'Business and Trade'),
      ServiceItem(id: appointmentId, name: 'Construction Permit Inspection Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Schedule onsite inspection for construction permit.', sectorName: 'Business and Trade'),
      ServiceItem(id: appointmentId, name: 'Business Inspection Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Onsite inspection for commercial businesses.', sectorName: 'Business and Trade'),
      ServiceItem(id: onlineId, name: 'Business Name Availability Check', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Search database for name availability.', sectorName: 'Business and Trade'),
    ];

    final generalServices = [
      ServiceItem(id: queueId, name: 'Police Clearance Application', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Request fingerprinting and background checks.', sectorName: 'General Inquiry'),
      ServiceItem(id: queueId, name: 'Education Certificate Authentication', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Authenticate school/university degrees.', sectorName: 'General Inquiry'),
      ServiceItem(id: queueId, name: 'Land Title Transfer Submission', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Submit documents for official land ownership transfer.', sectorName: 'General Inquiry'),
      ServiceItem(id: queueId, name: 'Utility Bill Support Counter', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Resolve utility bill issues and payment disputes.', sectorName: 'General Inquiry'),
      ServiceItem(id: queueId, name: 'Government Document Collection', mode: 'QUEUE', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Collect approved and printed official documents.', sectorName: 'General Inquiry'),
      ServiceItem(id: appointmentId, name: 'Social Support Service Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Meet with social worker for welfare assessment.', sectorName: 'General Inquiry'),
      ServiceItem(id: appointmentId, name: 'New Water Connection Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Request new water infrastructure installation connection.', sectorName: 'General Inquiry'),
      ServiceItem(id: appointmentId, name: 'New Electricity Connection Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Request new electricity power installation connection.', sectorName: 'General Inquiry'),
      ServiceItem(id: appointmentId, name: 'Court Hearing Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Register for scheduled court arbitration.', sectorName: 'General Inquiry'),
      ServiceItem(id: appointmentId, name: 'Public Housing Application Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Apply for public/governmental housing schemes.', sectorName: 'General Inquiry'),
      ServiceItem(id: appointmentId, name: 'Land Lease Consultation Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Consultation for leasing government/urban land.', sectorName: 'General Inquiry'),
      ServiceItem(id: appointmentId, name: 'Disability Support Registration Appointment', mode: 'APPOINTMENT', availability: 'Mon - Fri (08:30 - 17:30)', description: 'Registration for disability welfare programs.', sectorName: 'General Inquiry'),
      ServiceItem(id: onlineId, name: 'Download Government Forms', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Download PDF applications and regulations.', sectorName: 'General Inquiry'),
      ServiceItem(id: onlineId, name: 'Submit Complaint', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Submit formal service complaints to city board.', sectorName: 'General Inquiry'),
      ServiceItem(id: onlineId, name: 'Submit Feedback', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Submit anonymous portal usability reviews.', sectorName: 'General Inquiry'),
      ServiceItem(id: onlineId, name: 'Utility Bill Information Check', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Check unpaid utility bill dues.', sectorName: 'General Inquiry'),
      ServiceItem(id: onlineId, name: 'Government Notices Board', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Read latest municipal newsletters.', sectorName: 'General Inquiry'),
      ServiceItem(id: onlineId, name: 'Lost Document Reporting', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Formally report lost cards or files.', sectorName: 'General Inquiry'),
      ServiceItem(id: onlineId, name: 'FAQ Help Center', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Read dynamic help center answers.', sectorName: 'General Inquiry'),
    ];

    final technicalServices = [
      ServiceItem(id: onlineId, name: 'Check Application Status (All Services)', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Verify queue status or online request.', sectorName: 'Technical Support'),
      ServiceItem(id: onlineId, name: 'Certificate Verification System', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Verify integrity of printed QR certificates.', sectorName: 'Technical Support'),
      ServiceItem(id: onlineId, name: 'Application Tracking System', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Dynamic dashboard tracking current requests.', sectorName: 'Technical Support'),
      ServiceItem(id: onlineId, name: 'Notification Center', mode: 'ONLINE', availability: '24/7 Online Request', description: 'Real-time alert log.', sectorName: 'Technical Support'),
    ];

    final allApprovedServices = [
      ...civilStatusServices,
      ...immigrationServices,
      ...transportServices,
      ...taxServices,
      ...businessServices,
      ...generalServices,
      ...technicalServices,
    ];

    _appointmentServicesCache = allApprovedServices
        .where((service) => service.mode == 'APPOINTMENT')
        .toList(growable: false);
    _queueServicesCache = allApprovedServices
        .where((service) => service.mode == 'QUEUE')
        .toList(growable: false);
    _onlineServicesCache = allApprovedServices
        .where((service) => service.mode == 'ONLINE')
        .toList(growable: false);
  }

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
      _rebuildServiceCaches();
      appointments = results[2] as List<AppointmentItem>;
      queueHistory = results[3] as List<QueueTicket>;
      onlineRequests = results[4] as List<OnlineRequestItem>;
      helpDeskNotes = results[5] as List<HelpDeskNote>;
      myIssues = results[6] as List<HelpDeskQuestion>;
      final notifResult =
          results[7] as ({List<NotificationItem> items, int unreadCount});
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
      final next = await _api.getActiveQueue(token: token);
      final current = activeQueue;
      final isSame =
          (current == null && next == null) ||
          (current != null &&
              next != null &&
              current.id == next.id &&
              current.status == next.status &&
              current.peopleAhead == next.peopleAhead &&
              current.ticketNumber == next.ticketNumber);

      if (isSame) return;
      activeQueue = next;
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
      await _api.markNotificationAsRead(
        token: token,
        notificationId: notificationId,
      );
      notifications = notifications
          .map(
            (item) => item.id == notificationId
                ? NotificationItem(
                    id: item.id,
                    title: item.title,
                    message: item.message,
                    type: item.type,
                    isRead: true,
                    createdAt: item.createdAt,
                    relatedId: item.relatedId,
                  )
                : item,
          )
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
          .map(
            (item) => NotificationItem(
              id: item.id,
              title: item.title,
              message: item.message,
              type: item.type,
              isRead: true,
              createdAt: item.createdAt,
              relatedId: item.relatedId,
            ),
          )
          .toList();
      unreadNotifications = 0;
    } catch (e) {
      notificationsError = e.toString().replaceFirst('Exception: ', '');
    } finally {
      notifyListeners();
    }
  }
}
