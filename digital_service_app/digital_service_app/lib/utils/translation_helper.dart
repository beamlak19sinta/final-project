import 'package:flutter/material.dart';

class TranslationHelper {
  static String translate(BuildContext context, String text) {
    final isAmharic = Localizations.localeOf(context).languageCode == 'am';
    if (!isAmharic) return text;

    final trimmed = text.trim();
    if (_dictionary.containsKey(trimmed)) {
      return _dictionary[trimmed]!;
    }

    // Fuzzy matching / substring matching for robustness
    for (final entry in _dictionary.entries) {
      if (trimmed.toLowerCase() == entry.key.toLowerCase()) {
        return entry.value;
      }
    }

    return text;
  }

  static const Map<String, String> _dictionary = {
    // Sectors
    'Immigration and Nationality': 'ኢሚግሬሽን እና ዜግነት',
    'Transport and Logistics': 'ትራንስፖርት እና ሎጅስቲክስ',
    'Revenue and Tax': 'ገቢዎች እና ታክስ',
    'Civil Status Services': 'የሲቪል ሁኔታ አገልግሎቶች',
    'Business and Trade': 'ንግድ እና ኢንዱስትሪ',
    'General Inquiry': 'አጠቃላይ ጥያቄ',
    'Technical Support': 'ቴክኒካዊ ድጋፍ',
    
    // Core Services
    'Passport Renewal': 'የፓስፖርት እድሳት',
    'Passport Service': 'የፓስፖርት አገልግሎት',
    'Passport Application': 'የፓስፖርት ማመልከቻ',
    'New Passport Application': 'አዲስ የፓስፖርት ማመልከቻ',
    'Passport Replacement': 'የጠፋ/የተበላሸ ፓስፖርት መተካት',
    
    'Driver\'s License Renewal': 'የመንጃ ፈቃድ እድሳት',
    'Driver\'s License': 'የመንጃ ፈቃድ',
    'Driver License': 'የመንጃ ፈቃድ',
    'New Driver\'s License': 'አዲስ የመንጃ ፈቃድ',
    'Driver\'s License Replacement': 'የመንጃ ፈቃድ ምትክ',
    
    'National ID Registration': 'የብሄራዊ መታወቂያ ምዝገባ',
    'National ID Card': 'የብሄራዊ መታወቂያ ካርድ',
    'National ID': 'የብሄራዊ መታወቂያ',
    'New National ID': 'አዲስ የብሄራዊ መታወቂያ',
    
    'Tax Payment': 'የታክስ ክፍያ',
    'Tax Services': 'የታክስ አገልግሎቶች',
    'Tax Declaration': 'የታክስ ማስታወቂያ',
    'Property Tax': 'የንብረት ታክስ',
    'Income Tax Declaration': 'የገቢ ግብር ማስታወቂያ',
    
    'Business Registration': 'የንግድ ምዝገባ',
    'Business License': 'የንግድ ፈቃድ',
    'Business License Renewal': 'የንግድ ፈቃድ እድሳት',
    'New Business Registration': 'አዲስ የንግድ ምዝገባ',
    
    'Visa Services': 'የቪዛ አገልግሎቶች',
    'Visa Extension': 'የቪዛ ማራዘሚያ',
    'E-Visa Application': 'የኢ-ቪዛ ማመልከቻ',
    
    'Civil Registration': 'የሲቪል ምዝገባ',
    'Birth Certificate': 'የልደት ምስክር ወረቀት',
    'Marriage Certificate': 'የጋብቻ ምስክር ወረቀት',
    'Death Certificate': 'የሞት ምስክር ወረቀት',
    
    'Land Registration': 'የመሬት ምዝገባ',
    'Title Deed': 'የባለቤትነት ማረጋገጫ ካርታ',
    'Land Tax': 'የመሬት ግብር',
    
    'Health Insurance': 'የጤና መድን',
    'Community Health': 'የማህበረሰብ ጤና',
    
    // Help desk / Online Request Descriptions
    'Renew your passport online. Requires current passport copy and photo.': 'ፓስፖርትዎን በመስመር ላይ ያድሱ። የአሁኑ ፓስፖርት ቅጂ እና ፎቶ ያስፈልጋል።',
    'Apply for a new national digital ID card. Requires birth certificate or kebele ID.': 'አዲስ ብሄራዊ ዲጂታል መታወቂያ ካርድ ያመልክቱ። የልደት ምስክር ወረቀት ወይም የቀበሌ መታወቂያ ያስፈልጋል።',
    'Renew or replace your driver\'s license. Requires medical certificate.': 'የመንጃ ፈቃድዎን ያድሱ ወይም ይተኩ። የሕክምና ምስክር ወረቀት ያስፈልጋል።',
    'File and declare your annual income tax or property taxes securely online.': 'ዓመታዊ የገቢ ግብርዎን ወይም የንብረት ግብርዎን በመስመር ላይ በደህና ያሳውቁ እና ይክፈሉ።',
    'Register a new business name and apply for a commercial registration certificate.': 'አዲስ የንግድ ስም ይመዝግቡ እና ለንግድ ምዝገባ ምስክር ወረቀት ያመልክቱ።',
    'Apply for official birth certificate for newborns or retrieve existing certificate.': 'ለአዲስ ለተወለዱ ሕፃናት ይፋዊ የልደት ምስክር ወረቀት ያመልክቱ ወይም የነበረውን ያውጡ።',
    'Register marriage status and request official certified marriage certificate.': 'የጋብቻ ሁኔታን ይመዝግቡ እና ማረጋገጫ ምስክር ወረቀት ይጠይቁ።',
    'Submit technical issues regarding your citizen portal account or mobile app.': 'ስለ ዜጋ ፖርታል አካውንትዎ ወይም ስለ ሞባይል መተግበሪያው ቴክኒካዊ ችግሮችን ያቅርቡ።',
    'General support questions about government digital services and applications.': 'ስለ መንግስት ዲጂታል አገልግሎቶች እና ማመልከቻዎች አጠቃላይ የድጋፍ ጥያቄዎች።',
    'Submit general support queries': 'አጠቃላይ የድጋፍ ጥያቄዎችን ያቅርቡ',
    'Submit technical support requests': 'የቴክኒክ ድጋፍ ጥያቄዎችን ያቅርቡ',
    
    // Common statuses
    'Pending': 'በጥበቃ ላይ',
    'Processing': 'በሂደት ላይ',
    'Completed': 'ተጠናቋል',
    'Served': 'ተጠናቋል',
    'Active': 'በሂደት ላይ',
    'Scheduled': 'የተያዘ',
    'Cancelled': 'የተሰረዘ',
    'Rejected': 'ውድቅ የተደረገ',
    'Approved': 'የጸደቀ',
    'Failed': 'አልተሳካም',
  };

  static IconData getServiceIcon(String serviceName) {
    final name = serviceName.toLowerCase();
    if (name.contains('passport')) {
      return Icons.badge_outlined;
    } else if (name.contains('license') || name.contains('driver')) {
      return Icons.drive_eta_outlined;
    } else if (name.contains('id') || name.contains('national')) {
      return Icons.fingerprint_outlined;
    } else if (name.contains('tax') || name.contains('revenue')) {
      return Icons.account_balance_wallet_outlined;
    } else if (name.contains('business') || name.contains('trade') || name.contains('commercial')) {
      return Icons.storefront_outlined;
    } else if (name.contains('visa')) {
      return Icons.flight_takeoff_outlined;
    } else if (name.contains('birth') || name.contains('marriage') || name.contains('civil') || name.contains('death')) {
      return Icons.assignment_ind_outlined;
    } else if (name.contains('land') || name.contains('property')) {
      return Icons.landscape_outlined;
    } else if (name.contains('insurance') || name.contains('health')) {
      return Icons.medical_services_outlined;
    } else if (name.contains('support') || name.contains('technical') || name.contains('help')) {
      return Icons.support_agent_outlined;
    }
    return Icons.description_outlined;
  }
}
