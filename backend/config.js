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
      systemClientId: process.env.API_SYSTEM_CLIENT_ID || 'book-video-link-admin',
      systemClientSecret: process.env.API_SYSTEM_CLIENT_SECRET || 'clientsecret',
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
      timeoutSeconds: toInt(process.env.API_PRISONER_OFFENDER_SEARCH_ENDPOINT_URL, 30),
    },
    tokenverification: {
      url: process.env.TOKENVERIFICATION_API_URL || 'http://localhost:8100',
      timeoutSeconds: toInt(process.env.TOKENVERIFICATION_API_TIMEOUT_SECONDS, 10),
      enabled: process.env.TOKENVERIFICATION_API_ENABLED === 'true',
    },
  },

  notifications: {
    enabled: process.env.NOTIFY_ENABLED ? process.env.NOTIFY_ENABLED === 'true' : true,
    notifyKey: process.env.NOTIFY_API_KEY || '',

    bookingCreationConfirmationCourt: 'a1ef2e8c-4bc7-41c9-8f5c-ae2b6eda916d',
    bookingCreationConfirmationPrison: 'ca1eaae4-4061-4c6d-93e4-8807b6183e6c',

    bookingUpdateConfirmationCourt: 'cd55c74a-12d2-4999-8a41-9eece7a2e81f',
    bookingUpdateConfirmationPrison: 'bb534d9d-a512-4d77-96b4-ccf8fb4f6c37',

    bookingCancellationCourt: 'ba3d526c-e16a-427c-9997-1b4bf8e5e04a',
    bookingCancellationPrison: 'e21a2d16-7574-47e7-a231-ebee5668a598',

    requestBookingCourtTemplateVLBAdminId: 'c1008f55-c228-4cad-b6fd-fe931c993855',
    requestBookingCourtTemplateRequesterId: '02da54de-a564-4af8-8e6b-b141a85acf87',

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
    },
  },
}
