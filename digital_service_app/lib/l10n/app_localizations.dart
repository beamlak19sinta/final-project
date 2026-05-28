import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_am.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('am'),
    Locale('en'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Dagmawi Menelik Digital Service'**
  String get appTitle;

  /// No description provided for @citizenPortal.
  ///
  /// In en, this message translates to:
  /// **'Citizen Portal'**
  String get citizenPortal;

  /// No description provided for @citizen.
  ///
  /// In en, this message translates to:
  /// **'Citizen'**
  String get citizen;

  /// No description provided for @signInToAccessServices.
  ///
  /// In en, this message translates to:
  /// **'Sign in to access services'**
  String get signInToAccessServices;

  /// No description provided for @createCitizenAccount.
  ///
  /// In en, this message translates to:
  /// **'Create Citizen Account'**
  String get createCitizenAccount;

  /// No description provided for @registerSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Register to book appointments and join queues'**
  String get registerSubtitle;

  /// No description provided for @close.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// No description provided for @login.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get login;

  /// No description provided for @register.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get register;

  /// No description provided for @phoneNumber.
  ///
  /// In en, this message translates to:
  /// **'Phone Number'**
  String get phoneNumber;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @forgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPassword;

  /// No description provided for @forgotPasswordTitle.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password'**
  String get forgotPasswordTitle;

  /// No description provided for @generateResetToken.
  ///
  /// In en, this message translates to:
  /// **'Generate Reset Token'**
  String get generateResetToken;

  /// No description provided for @generating.
  ///
  /// In en, this message translates to:
  /// **'Generating...'**
  String get generating;

  /// No description provided for @resetToken.
  ///
  /// In en, this message translates to:
  /// **'Reset Token'**
  String get resetToken;

  /// No description provided for @newPassword.
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get newPassword;

  /// No description provided for @resetPassword.
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get resetPassword;

  /// No description provided for @resetting.
  ///
  /// In en, this message translates to:
  /// **'Resetting...'**
  String get resetting;

  /// No description provided for @passwordResetSuccessful.
  ///
  /// In en, this message translates to:
  /// **'Password reset successful'**
  String get passwordResetSuccessful;

  /// No description provided for @dontHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account? Register'**
  String get dontHaveAccount;

  /// No description provided for @alreadyHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account? Login'**
  String get alreadyHaveAccount;

  /// No description provided for @fullName.
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get fullName;

  /// No description provided for @nationalId.
  ///
  /// In en, this message translates to:
  /// **'National ID'**
  String get nationalId;

  /// No description provided for @dashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get dashboard;

  /// No description provided for @appointments.
  ///
  /// In en, this message translates to:
  /// **'Appointments'**
  String get appointments;

  /// No description provided for @yourAppointments.
  ///
  /// In en, this message translates to:
  /// **'Your Appointments'**
  String get yourAppointments;

  /// No description provided for @scheduleYourVisit.
  ///
  /// In en, this message translates to:
  /// **'Schedule your visit with our services'**
  String get scheduleYourVisit;

  /// No description provided for @noAppointmentsYet.
  ///
  /// In en, this message translates to:
  /// **'No appointments yet'**
  String get noAppointmentsYet;

  /// No description provided for @bookFirstAppointment.
  ///
  /// In en, this message translates to:
  /// **'Book your first appointment to get started'**
  String get bookFirstAppointment;

  /// No description provided for @appointmentCancelled.
  ///
  /// In en, this message translates to:
  /// **'Appointment cancelled'**
  String get appointmentCancelled;

  /// No description provided for @cancelAppointment.
  ///
  /// In en, this message translates to:
  /// **'Cancel Appointment'**
  String get cancelAppointment;

  /// No description provided for @bookAppointmentTitle.
  ///
  /// In en, this message translates to:
  /// **'Book Appointment'**
  String get bookAppointmentTitle;

  /// No description provided for @selectService.
  ///
  /// In en, this message translates to:
  /// **'Select service'**
  String get selectService;

  /// No description provided for @date.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get date;

  /// No description provided for @dateHint.
  ///
  /// In en, this message translates to:
  /// **'YYYY-MM-DD'**
  String get dateHint;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @availableTimeSlots.
  ///
  /// In en, this message translates to:
  /// **'Available time slots'**
  String get availableTimeSlots;

  /// No description provided for @noSlotsAvailableForDate.
  ///
  /// In en, this message translates to:
  /// **'No slots available for the selected date.'**
  String get noSlotsAvailableForDate;

  /// No description provided for @pickServiceAndDate.
  ///
  /// In en, this message translates to:
  /// **'Pick a service and date to see available slots.'**
  String get pickServiceAndDate;

  /// No description provided for @pleaseSelectAllFields.
  ///
  /// In en, this message translates to:
  /// **'Please select service, date, and time slot.'**
  String get pleaseSelectAllFields;

  /// No description provided for @booking.
  ///
  /// In en, this message translates to:
  /// **'Booking...'**
  String get booking;

  /// No description provided for @confirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get confirm;

  /// No description provided for @queue.
  ///
  /// In en, this message translates to:
  /// **'Queue'**
  String get queue;

  /// No description provided for @activeTicket.
  ///
  /// In en, this message translates to:
  /// **'Active Ticket'**
  String get activeTicket;

  /// No description provided for @availableServices.
  ///
  /// In en, this message translates to:
  /// **'Available Services'**
  String get availableServices;

  /// No description provided for @history.
  ///
  /// In en, this message translates to:
  /// **'History'**
  String get history;

  /// No description provided for @ticketNo.
  ///
  /// In en, this message translates to:
  /// **'TICKET NO'**
  String get ticketNo;

  /// No description provided for @peopleAhead.
  ///
  /// In en, this message translates to:
  /// **'PEOPLE AHEAD'**
  String get peopleAhead;

  /// No description provided for @cancelTicket.
  ///
  /// In en, this message translates to:
  /// **'Cancel Ticket'**
  String get cancelTicket;

  /// No description provided for @ticketCancelled.
  ///
  /// In en, this message translates to:
  /// **'Ticket cancelled'**
  String get ticketCancelled;

  /// No description provided for @join.
  ///
  /// In en, this message translates to:
  /// **'Join'**
  String get join;

  /// No description provided for @joinedQueueSuccess.
  ///
  /// In en, this message translates to:
  /// **'Successfully joined the queue!'**
  String get joinedQueueSuccess;

  /// No description provided for @noQueueHistory.
  ///
  /// In en, this message translates to:
  /// **'No queue history available.'**
  String get noQueueHistory;

  /// No description provided for @notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// No description provided for @noNotificationsYet.
  ///
  /// In en, this message translates to:
  /// **'No notifications yet.'**
  String get noNotificationsYet;

  /// No description provided for @markAsRead.
  ///
  /// In en, this message translates to:
  /// **'Mark as read'**
  String get markAsRead;

  /// No description provided for @unknownDate.
  ///
  /// In en, this message translates to:
  /// **'Unknown date'**
  String get unknownDate;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @editDetails.
  ///
  /// In en, this message translates to:
  /// **'Edit Details'**
  String get editDetails;

  /// No description provided for @updateProfile.
  ///
  /// In en, this message translates to:
  /// **'Update Profile'**
  String get updateProfile;

  /// No description provided for @profileUpdatedSuccessfully.
  ///
  /// In en, this message translates to:
  /// **'Profile updated successfully'**
  String get profileUpdatedSuccessfully;

  /// No description provided for @security.
  ///
  /// In en, this message translates to:
  /// **'Security'**
  String get security;

  /// No description provided for @currentPassword.
  ///
  /// In en, this message translates to:
  /// **'Current Password'**
  String get currentPassword;

  /// No description provided for @changePassword.
  ///
  /// In en, this message translates to:
  /// **'Change Password'**
  String get changePassword;

  /// No description provided for @passwordChangedSuccessfully.
  ///
  /// In en, this message translates to:
  /// **'Password changed successfully'**
  String get passwordChangedSuccessfully;

  /// No description provided for @preferences.
  ///
  /// In en, this message translates to:
  /// **'Preferences'**
  String get preferences;

  /// No description provided for @services.
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get services;

  /// No description provided for @onlineServices.
  ///
  /// In en, this message translates to:
  /// **'Online Services'**
  String get onlineServices;

  /// No description provided for @myRequestHistory.
  ///
  /// In en, this message translates to:
  /// **'My Request History'**
  String get myRequestHistory;

  /// No description provided for @noServicesAvailable.
  ///
  /// In en, this message translates to:
  /// **'No services available at the moment.'**
  String get noServicesAvailable;

  /// No description provided for @noOnlineRequests.
  ///
  /// In en, this message translates to:
  /// **'No online requests submitted.'**
  String get noOnlineRequests;

  /// No description provided for @submitRequest.
  ///
  /// In en, this message translates to:
  /// **'Submit Request'**
  String get submitRequest;

  /// No description provided for @requestService.
  ///
  /// In en, this message translates to:
  /// **'Request {serviceName}'**
  String requestService(Object serviceName);

  /// No description provided for @remarks.
  ///
  /// In en, this message translates to:
  /// **'Remarks'**
  String get remarks;

  /// No description provided for @remarksHint.
  ///
  /// In en, this message translates to:
  /// **'Provide details for your request...'**
  String get remarksHint;

  /// No description provided for @pleaseEnterRemarks.
  ///
  /// In en, this message translates to:
  /// **'Please enter remarks first'**
  String get pleaseEnterRemarks;

  /// No description provided for @requestSubmittedSuccessfully.
  ///
  /// In en, this message translates to:
  /// **'Request submitted successfully!'**
  String get requestSubmittedSuccessfully;

  /// No description provided for @helpDesk.
  ///
  /// In en, this message translates to:
  /// **'Help Desk'**
  String get helpDesk;

  /// No description provided for @frequentlyAskedQuestions.
  ///
  /// In en, this message translates to:
  /// **'Frequently Asked Questions'**
  String get frequentlyAskedQuestions;

  /// No description provided for @submitIssue.
  ///
  /// In en, this message translates to:
  /// **'Submit issue'**
  String get submitIssue;

  /// No description provided for @issueSubmitted.
  ///
  /// In en, this message translates to:
  /// **'Issue submitted'**
  String get issueSubmitted;

  /// No description provided for @sendToSupport.
  ///
  /// In en, this message translates to:
  /// **'Send to Support'**
  String get sendToSupport;

  /// No description provided for @myIssues.
  ///
  /// In en, this message translates to:
  /// **'My Issues'**
  String get myIssues;

  /// No description provided for @noReplyYet.
  ///
  /// In en, this message translates to:
  /// **'No reply yet'**
  String get noReplyYet;

  /// No description provided for @anonymousFeedback.
  ///
  /// In en, this message translates to:
  /// **'Anonymous Feedback'**
  String get anonymousFeedback;

  /// No description provided for @yourFeedback.
  ///
  /// In en, this message translates to:
  /// **'Your feedback'**
  String get yourFeedback;

  /// No description provided for @rating.
  ///
  /// In en, this message translates to:
  /// **'Rating'**
  String get rating;

  /// No description provided for @submitFeedback.
  ///
  /// In en, this message translates to:
  /// **'Submit Feedback'**
  String get submitFeedback;

  /// No description provided for @submitting.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get submitting;

  /// No description provided for @feedbackSubmitted.
  ///
  /// In en, this message translates to:
  /// **'Feedback submitted'**
  String get feedbackSubmitted;

  /// No description provided for @noDataAvailable.
  ///
  /// In en, this message translates to:
  /// **'No data available'**
  String get noDataAvailable;

  /// No description provided for @submitFailed.
  ///
  /// In en, this message translates to:
  /// **'Submit failed: {error}'**
  String submitFailed(Object error);

  /// No description provided for @takeTicket.
  ///
  /// In en, this message translates to:
  /// **'Take Ticket'**
  String get takeTicket;

  /// No description provided for @bookAppointment.
  ///
  /// In en, this message translates to:
  /// **'Book Appointment'**
  String get bookAppointment;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @status.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get status;

  /// No description provided for @home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @welcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get welcome;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @submit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get submit;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get loading;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['am', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'am':
      return AppLocalizationsAm();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
