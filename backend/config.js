const toInt = (envVar, defaultVal) => (envVar ? parseInt(envVar, 10) : defaultVal)

module.exports = {
  app: {
    port: process.env.PORT || 3000,
    production: process.env.NODE_ENV === 'production',
    tokenRefreshThresholdSeconds: toInt(process.env.TOKEN_REFRESH_THRESHOLD_SECONDS, 60),
    url: process.env.BOOK_VIDEO_LINK_UI_URL || `http://localhost:${process.env.PORT || 3000}/`,
    maximumFileUploadSizeInMb: toInt(process.env.MAXIMUM_FILE_UPLOAD_SIZE_IN_MB, 200),
    videoLinkEnabledFor: (process.env.VIDEO_LINK_ENABLED_FOR || '').split(','),
  },

  supportEmail: 'bookavideolink@digital.justice.gov.uk',

  supportTelephone: '0800 917 5148',

  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  },
  hmppsCookie: {
    name: process.env.HMPPS_COOKIE_NAME || 'hmpps-session-dev',
    domain: process.env.HMPPS_COOKIE_DOMAIN || 'localhost',
    expiryMinutes: toInt(process.env.WEB_SESSION_TIMEOUT_IN_MINUTES, 60),
    sessionSecret: process.env.SESSION_COOKIE_SECRET || 'bvl-insecure-session',
  },
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST,
    port: toInt(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_AUTH_TOKEN,
  },
  apis: {
    oauth2: {
      url: process.env.OAUTH_ENDPOINT_URL || 'http://localhost:9090/auth/',
      ui_url: process.env.OAUTH_ENDPOINT_UI_URL || process.env.OAUTH_ENDPOINT_URL || 'http://localhost:9090/auth/',
      timeoutSeconds: toInt(process.env.API_ENDPOINT_TIMEOUT_SECONDS, 10),
      clientId: process.env.API_CLIENT_ID || 'book-video-link-client',
      clientSecret: process.env.API_CLIENT_SECRET || 'clientsecret',
      systemId: process.env.API_SYSTEM_ID || 'book-video-link-system',
      systemSecret: process.env.API_SYSTEM_SECRET || 'systemsecret',
    },
    prison: {
      url: process.env.API_ENDPOINT_URL || 'http://localhost:8080/',
      timeoutSeconds: toInt(process.env.API_ENDPOINT_TIMEOUT_SECONDS, 30),
    },
    whereabouts: {
      url: process.env.API_WHEREABOUTS_ENDPOINT_URL || 'http://localhost:8082/',
      timeoutSeconds: toInt(process.env.API_WHEREABOUTS_ENDPOINT_TIMEOUT_SECONDS, 30),
    },
    prisonerOffenderSearch: {
      url: process.env.API_PRISONER_OFFENDER_SEARCH_ENDPOINT_URL || 'http://localhost:8083/',
      timeoutSeconds: toInt(process.env.API_PRISONER_OFFENDER_SEARCH_TIMEOUT_SECONDS, 30),
    },
    tokenverification: {
      url: process.env.TOKENVERIFICATION_API_URL || 'http://localhost:8100',
      timeoutSeconds: toInt(process.env.TOKENVERIFICATION_API_TIMEOUT_SECONDS, 10),
      enabled: process.env.TOKENVERIFICATION_API_ENABLED === 'true',
    },
    userPreferences: {
      url: process.env.API_HMPPS_USER_PREFERENCE_ENDPOINT_URL || 'http://localhost:8085/',
      timeoutSeconds: toInt(process.env.API_HMPPS_USER_PREFERENCE_TIMEOUT_SECONDS, 30),
    },
    googleApi: {
      serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    },
  },

  notifications: {
    enabled: process.env.NOTIFY_ENABLED ? process.env.NOTIFY_ENABLED === 'true' : true,
    notifyKey: process.env.NOTIFY_API_KEY || '',

    bookingCreationConfirmationCourt: '47cfc1c3-ad56-47c4-98e7-0e41c0e2c9b4',
    bookingCreationConfirmationPrison: '05456200-846b-446e-81cb-e003611bfea6',

    bookingUpdateConfirmationCourt: 'a9d69cd4-0775-4902-87ae-4891c5ccaf11',
    bookingUpdateConfirmationPrison: 'ed299559-7e58-4e60-b5aa-b5f0eababeb1',

    bookingCancellationCourt: '544fc4a2-d04a-4e97-aa12-1516f30dc11a',
    bookingCancellationPrison: '41063a6b-66a5-4a1a-b9ef-a78fd3c137cc',

    requestBookingCourtTemplateVLBAdminId: 'fab3084c-49bc-444e-acd7-030291978562',
    requestBookingCourtTemplateRequesterId: 'bc5f77eb-792b-4ae0-8216-3f9012bca220',

    emails: {
      WWI: {
        omu: process.env.WANDSWORTH_OMU_EMAIL,
        vlb: process.env.WANDSWORTH_VLB_EMAIL,
      },
      TSI: {
        omu: process.env.THAMESIDE_OMU_EMAIL,
        vlb: process.env.THAMESIDE_VLB_EMAIL,
      },
      HEI: {
        omu: process.env.HEWELL_OMU_EMAIL,
        vlb: process.env.HEWELL_VLB_EMAIL,
      },
      BWI: {
        omu: process.env.BERWYN_OMU_EMAIL,
        vlb: process.env.BERWYN_VLB_EMAIL,
      },
      NMI: {
        omu: process.env.NOTTINGHAM_OMU_EMAIL,
        vlb: process.env.NOTTINGHAM_VLB_EMAIL,
      },
      EYI: {
        omu: process.env.ELMLEY_OMU_EMAIL,
        vlb: process.env.ELMLEY_VLB_EMAIL,
      },
      BNI: {
        omu: process.env.BULLINGDON_OMU_EMAIL,
        vlb: process.env.BULLINGDON_VLB_EMAIL,
      },
    },
  },

  jobs: {
    videoLinkBookingEventsExport: {
      spreadsheetId: process.env.VLBEVENT_EXPORT_SPREADSHEET_ID,
    },
  },
}
