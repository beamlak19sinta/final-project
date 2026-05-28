import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../models/appointment_item.dart';
import '../models/helpdesk_note.dart';
import '../models/helpdesk_question.dart';
import '../models/notification_item.dart';
import '../models/online_request_item.dart';
import '../models/queue_ticket.dart';
import '../models/service_sector.dart';
import '../models/user_profile.dart';

class ApiService {
  ApiService({
    this.baseUrl = AppConfig.baseApiUrl,
    http.Client? client,
  }) : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  static const Duration _timeout = Duration(seconds: 25);

  Map<String, String> _headers({String? token}) => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Future<http.Response> _safeHttp(Future<http.Response> Function() call) async {
    try {
      final response = await call().timeout(_timeout);
      print('[ApiService DEBUG] HTTP Response Status: ${response.statusCode}');
      print('[ApiService DEBUG] HTTP Response Body: ${response.body}');
      return response;
    } on TimeoutException catch (e, stackTrace) {
      print('[ApiService ERROR] TimeoutException: Request timed out.');
      print('[ApiService ERROR] Target Base URL: $baseUrl');
      print('[ApiService ERROR] StackTrace: $stackTrace');
      throw Exception('Connection timed out. Please check if the server is running at $baseUrl and your device is on the same network.');
    } on SocketException catch (e, stackTrace) {
      print('[ApiService ERROR] SocketException encountered:');
      print('[ApiService ERROR] Host: ${e.address?.host ?? "unknown"}, Port: ${e.port ?? "unknown"}');
      print('[ApiService ERROR] Message: ${e.message}');
      print('[ApiService ERROR] OS Error: ${e.osError?.message ?? "none"} (Code: ${e.osError?.errorCode ?? "none"})');
      print('[ApiService ERROR] Target Base URL: $baseUrl');
      print('[ApiService ERROR] StackTrace: $stackTrace');
      
      final errMsg = e.toString().toLowerCase();
      if (errMsg.contains('failed host lookup') || errMsg.contains('unreachable')) {
        throw Exception('Server is unreachable. Please verify you are connected to the same Wi-Fi network as the backend PC at $baseUrl.');
      } else if (errMsg.contains('connection refused')) {
        throw Exception('Connection refused. Ensure the backend server is running on the PC and listening on port 5000 (accessible at $baseUrl).');
      } else {
        throw Exception('Network error. Please check your connection. Details: ${e.message}');
      }
    } catch (e, stackTrace) {
      print('[ApiService ERROR] Unexpected error: $e');
      print('[ApiService ERROR] Target Base URL: $baseUrl');
      print('[ApiService ERROR] StackTrace: $stackTrace');
      
      final errStr = e.toString().toLowerCase();
      if (errStr.contains('socketexception') || errStr.contains('connection failed') || errStr.contains('clientexception')) {
        throw Exception('Server is unavailable or no internet connection. Target: $baseUrl');
      }
      throw Exception('A network error occurred. Please check your connection. Details: $e');
    }
  }

  Future<Map<String, dynamic>> login(String phoneNumber, String password) async {
    final response = await _safeHttp(
      () => _client.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _headers(),
        body: jsonEncode({'phoneNumber': phoneNumber, 'password': password}),
      ),
    );
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception((body['message'] ?? 'Login failed').toString());
    }
    return body['data'] as Map<String, dynamic>? ?? body;
  }

  Future<void> registerCitizen({
    required String name,
    required String phoneNumber,
    required String nationalId,
    required String password,
  }) async {
    final response = await _safeHttp(
      () => _client.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: _headers(),
        body: jsonEncode({
          'name': name,
          'phoneNumber': phoneNumber,
          'nationalId': nationalId,
          'password': password,
          'role': 'CITIZEN',
        }),
      ),
    );
    if (response.statusCode != 201) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception((body['message'] ?? 'Registration failed').toString());
    }
  }

  Future<String> requestPasswordResetToken(String phoneNumber) async {
    final response = await _safeHttp(
      () => _client.post(
        Uri.parse('$baseUrl/auth/forgot-password'),
        headers: _headers(),
        body: jsonEncode({'phoneNumber': phoneNumber}),
      ),
    );
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception((body['message'] ?? 'Failed to request reset').toString());
    }
    return (body['token'] ?? '').toString();
  }

  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    final response = await _safeHttp(
      () => _client.post(
        Uri.parse('$baseUrl/auth/reset-password'),
        headers: _headers(),
        body: jsonEncode({'token': token, 'newPassword': newPassword}),
      ),
    );
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception((body['message'] ?? 'Failed to reset password').toString());
    }
  }

  Future<List<ServiceSector>> fetchCitizenServices({required String token}) async {
    final response = await _safeHttp(
      () => _client.get(
        Uri.parse('$baseUrl/services/citizen'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to load citizen services');
    }

    final List<dynamic> body = jsonDecode(response.body) as List<dynamic>;
    return body
        .whereType<Map<String, dynamic>>()
        .map(ServiceSector.fromJson)
        .toList();
  }

  Future<List<ServiceSector>> fetchSupportServices({required String token}) async {
    final response = await _safeHttp(
      () => _client.get(
        Uri.parse('$baseUrl/services/support'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to load support services');
    }

    final List<dynamic> body = jsonDecode(response.body) as List<dynamic>;
    return body.whereType<Map<String, dynamic>>().map(ServiceSector.fromJson).toList();
  }

  Future<List<HelpDeskNote>> fetchHelpDeskNotes({required String token}) async {
    final response = await _safeHttp(
      () => _client.get(
        Uri.parse('$baseUrl/helpdesk/notes'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to load help desk notes');
    }

    final Map<String, dynamic> body = jsonDecode(response.body) as Map<String, dynamic>;
    final List<dynamic> notes = (body['data'] as List<dynamic>? ?? const []);
    return notes
        .whereType<Map<String, dynamic>>()
        .map(HelpDeskNote.fromJson)
        .toList();
  }

  Future<QueueTicket?> getActiveQueue({required String token}) async {
    final response = await _safeHttp(
      () => _client.get(
        Uri.parse('$baseUrl/queues/my-status'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) throw Exception('Failed to load queue status');
    if (response.body.trim() == 'null') return null;
    final body = jsonDecode(response.body);
    if (body == null) return null;
    return QueueTicket.fromJson(body as Map<String, dynamic>);
  }

  Future<List<QueueTicket>> getQueueHistory({required String token}) async {
    final response = await _safeHttp(
      () => _client.get(
        Uri.parse('$baseUrl/queues/my-history'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) throw Exception('Failed to load queue history');
    final List<dynamic> body = jsonDecode(response.body) as List<dynamic>;
    return body.whereType<Map<String, dynamic>>().map(QueueTicket.fromJson).toList();
  }

  Future<QueueTicket> joinQueue({
    required String token,
    required String serviceId,
  }) async {
    final response = await _safeHttp(
      () => _client.post(
        Uri.parse('$baseUrl/queues/take'),
        headers: _headers(token: token),
        body: jsonEncode({'serviceId': serviceId}),
      ),
    );
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 201) {
      throw Exception((body['message'] ?? 'Failed to join queue').toString());
    }
    return QueueTicket.fromJson(body);
  }

  Future<void> cancelQueueTicket({
    required String token,
    required String queueId,
  }) async {
    final response = await _safeHttp(
      () => _client.delete(
        Uri.parse('$baseUrl/queues/$queueId'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception((body['message'] ?? 'Failed to cancel queue').toString());
    }
  }

  Future<List<AppointmentItem>> getMyAppointments({required String token}) async {
    final response = await _safeHttp(
      () => _client.get(
        Uri.parse('$baseUrl/appointments/my'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) throw Exception('Failed to load appointments');
    final List<dynamic> body = jsonDecode(response.body) as List<dynamic>;
    return body.whereType<Map<String, dynamic>>().map(AppointmentItem.fromJson).toList();
  }

  Future<void> bookAppointment({
    required String token,
    required String serviceId,
    required String date,
    required String timeSlot,
  }) async {
    final response = await _safeHttp(
      () => _client.post(
        Uri.parse('$baseUrl/appointments/book'),
        headers: _headers(token: token),
        body: jsonEncode({'serviceId': serviceId, 'date': date, 'timeSlot': timeSlot}),
      ),
    );
    if (response.statusCode != 201) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception((body['message'] ?? 'Failed to book').toString());
    }
  }

  Future<void> cancelAppointment({
    required String token,
    required String appointmentId,
  }) async {
    final response = await _safeHttp(
      () => _client.delete(
        Uri.parse('$baseUrl/appointments/$appointmentId'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception((body['message'] ?? 'Failed to cancel appointment').toString());
    }
  }

  Future<List<String>> getAvailableAppointmentSlots({
    required String token,
    required String serviceId,
    required String date,
  }) async {
    final uri = Uri.parse(
      '$baseUrl/appointments/slots?serviceId=${Uri.encodeComponent(serviceId)}&date=${Uri.encodeComponent(date)}',
    );
    final response = await _safeHttp(
      () => _client.get(
        uri,
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) {
      final body = jsonDecode(response.body);
      if (body is Map<String, dynamic>) {
        throw Exception((body['message'] ?? 'Failed to load slots').toString());
      }
      throw Exception('Failed to load slots');
    }
    final List<dynamic> body = jsonDecode(response.body) as List<dynamic>;
    return body.map((e) => e.toString()).toList();
  }

  Future<({List<NotificationItem> items, int unreadCount})> getNotifications({
    required String token,
  }) async {
    final response = await _safeHttp(
      () => _client.get(
        Uri.parse('$baseUrl/notifications'),
        headers: _headers(token: token),
      ),
    );
    final body = jsonDecode(response.body);
    if (response.statusCode != 200) {
      if (body is Map<String, dynamic>) {
        throw Exception((body['message'] ?? 'Failed to load notifications').toString());
      }
      throw Exception('Failed to load notifications');
    }

    final map = body as Map<String, dynamic>;
    final List<dynamic> data = (map['data'] as List<dynamic>? ?? const []);
    final unreadCount = (map['unreadCount'] as num?)?.toInt() ?? 0;
    return (
      items: data.whereType<Map<String, dynamic>>().map(NotificationItem.fromJson).toList(),
      unreadCount: unreadCount,
    );
  }

  Future<void> markNotificationAsRead({
    required String token,
    required String notificationId,
  }) async {
    final response = await _safeHttp(
      () => _client.patch(
        Uri.parse('$baseUrl/notifications/$notificationId/read'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) {
      final body = jsonDecode(response.body);
      if (body is Map<String, dynamic>) {
        throw Exception((body['message'] ?? 'Failed to update notification').toString());
      }
      throw Exception('Failed to update notification');
    }
  }

  Future<void> markAllNotificationsAsRead({required String token}) async {
    final response = await _safeHttp(
      () => _client.patch(
        Uri.parse('$baseUrl/notifications/read-all'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) {
      final body = jsonDecode(response.body);
      if (body is Map<String, dynamic>) {
        throw Exception((body['message'] ?? 'Failed to update notifications').toString());
      }
      throw Exception('Failed to update notifications');
    }
  }

  Future<List<OnlineRequestItem>> getMyRequests({required String token}) async {
    final response = await _safeHttp(
      () => _client.get(
        Uri.parse('$baseUrl/requests/my-requests'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) throw Exception('Failed to load requests');
    final List<dynamic> body = jsonDecode(response.body) as List<dynamic>;
    return body.whereType<Map<String, dynamic>>().map(OnlineRequestItem.fromJson).toList();
  }

  Future<void> submitOnlineRequest({
    required String token,
    required String serviceId,
    required String remarks,
  }) async {
    final response = await _safeHttp(
      () => _client.post(
        Uri.parse('$baseUrl/requests/submit'),
        headers: _headers(token: token),
        body: jsonEncode({'serviceId': serviceId, 'remarks': remarks, 'data': {}}),
      ),
    );
    if (response.statusCode != 201) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception((body['message'] ?? 'Failed to submit request').toString());
    }
  }

  Future<void> submitHelpDeskIssue({
    required String token,
    required String question,
  }) async {
    final response = await _safeHttp(
      () => _client.post(
        Uri.parse('$baseUrl/helpdesk/questions'),
        headers: _headers(token: token),
        body: jsonEncode({'question': question}),
      ),
    );
    if (response.statusCode != 201) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception((body['message'] ?? 'Failed to submit issue').toString());
    }
  }

  Future<List<HelpDeskQuestion>> getMyHelpDeskQuestions({required String token}) async {
    final response = await _safeHttp(
      () => _client.get(
        Uri.parse('$baseUrl/helpdesk/questions/my'),
        headers: _headers(token: token),
      ),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to load issue status');
    }
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final data = (body['data'] as List<dynamic>? ?? const []);
    return data
        .whereType<Map<String, dynamic>>()
        .map(HelpDeskQuestion.fromJson)
        .toList();
  }

  Future<void> submitFeedback({
    String? token,
    required String message,
    int? rating,
  }) async {
    final payload = <String, dynamic>{'message': message, 'rating': rating}
      ..removeWhere((_, value) => value == null);
    final response = await _safeHttp(
      () => _client.post(
        Uri.parse('$baseUrl/feedback'),
        headers: _headers(token: token),
        body: jsonEncode(payload),
      ),
    );
    if (response.statusCode != 201) {
      throw Exception('Failed to submit feedback');
    }
  }

  Future<UserProfile> updateProfile({
    required String token,
    required String name,
    required String phoneNumber,
  }) async {
    final response = await _safeHttp(
      () => _client.patch(
        Uri.parse('$baseUrl/auth/profile'),
        headers: _headers(token: token),
        body: jsonEncode({'name': name, 'phoneNumber': phoneNumber}),
      ),
    );
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception((body['message'] ?? 'Failed to update profile').toString());
    }
    return UserProfile.fromJson(body['user'] as Map<String, dynamic>? ?? {});
  }

  Future<void> changePassword({
    required String token,
    required String currentPassword,
    required String newPassword,
  }) async {
    final response = await _safeHttp(
      () => _client.patch(
        Uri.parse('$baseUrl/auth/password'),
        headers: _headers(token: token),
        body: jsonEncode({'currentPassword': currentPassword, 'newPassword': newPassword}),
      ),
    );
    if (response.statusCode != 200) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception((body['message'] ?? 'Failed to change password').toString());
    }
  }
}
