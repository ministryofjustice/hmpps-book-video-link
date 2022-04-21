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
    googleTagManagerKey: process.env.GOOGLE_TAG_MANAGER_KEY,
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
    prisonRegister: {
      url: process.env.API_PRISON_REGISTER_ENDPOINT_URL || 'http://localhost:8085/',
      timeoutSeconds: toInt(process.env.API_PRISON_REGISTER_ENDPOINT_TIMEOUT_SECONDS, 30),
    },
  },

  notifications: {
    enabled: process.env.NOTIFY_ENABLED ? process.env.NOTIFY_ENABLED === 'true' : true,
    notifyKey: process.env.NOTIFY_API_KEY || '',

    bookingCreationConfirmationCourt: '47cfc1c3-ad56-47c4-98e7-0e41c0e2c9b4',
    bookingCreationConfirmationPrison: '7a5fe332-0001-4ef2-bd06-5595c01552f5',
    bookingCreationConfirmationPrisonWithCourtEmailAddress: 'f659c351-da69-4a59-984b-8345e59c6048',

    bookingUpdateConfirmationCourt: 'a9d69cd4-0775-4902-87ae-4891c5ccaf11',
    bookingUpdateConfirmationPrison: 'aa1f124f-f68a-413b-86ea-6fac8e4e9bce',
    bookingUpdateConfirmationPrisonWithCourtEmailAddress: 'ddff3026-fd5a-4eec-bbb3-596a85173b97',

    bookingCancellationCourt: '544fc4a2-d04a-4e97-aa12-1516f30dc11a',
    bookingCancellationPrison: 'f6518f88-8caa-4bba-9002-e66346c66868',
    bookingCancellationPrisonWithCourtEmailAddress: 'aca7fd73-0096-4142-a604-c9bd2f19e1f4',

    requestBookingCourtTemplateVLBAdminId: 'fab3084c-49bc-444e-acd7-030291978562',
    requestBookingCourtTemplateRequesterId: 'bc5f77eb-792b-4ae0-8216-3f9012bca220',
  },

  jobs: {
    videoLinkBookingEventsExport: {
      spreadsheetId: process.env.VLBEVENT_EXPORT_SPREADSHEET_ID,
    },
  },
}
