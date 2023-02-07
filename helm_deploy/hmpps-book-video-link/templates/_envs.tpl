{{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" }}
env:
  - name: API_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_CLIENT_ID

  - name: API_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_CLIENT_SECRET

  - name: API_SYSTEM_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_SYSTEM_ID

  - name: API_SYSTEM_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_SYSTEM_SECRET

  - name: APPINSIGHTS_INSTRUMENTATIONKEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: APPINSIGHTS_INSTRUMENTATIONKEY

  - name: GOOGLE_TAG_MANAGER_KEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: GOOGLE_TAG_MANAGER_KEY

  - name: SESSION_COOKIE_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: SESSION_COOKIE_SECRET

  - name: NOTIFY_API_KEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: NOTIFY_API_KEY

  - name: REDIS_HOST
    valueFrom:
      secretKeyRef:
        name: hmpps-book-video-link-elasticache-redis
        key: primary_endpoint_address

  - name: REDIS_AUTH_TOKEN
    valueFrom:
      secretKeyRef:
        name: hmpps-book-video-link-elasticache-redis
        key: auth_token

  - name: REDIS_TLS_ENABLED
    value: {{ .Values.env.REDIS_TLS_ENABLED }}
    value: "true"

  - name: API_ENDPOINT_URL
    value: {{ .Values.env.API_ENDPOINT_URL | quote }}

  - name: OAUTH_ENDPOINT_URL
    value: {{ .Values.env.OAUTH_ENDPOINT_URL | quote }}

  - name: BOOK_VIDEO_LINK_UI_URL
    value: "https://{{ .Values.ingress.host }}/"

  - name: API_WHEREABOUTS_ENDPOINT_URL
    value: {{ .Values.env.API_WHEREABOUTS_ENDPOINT_URL | quote }}

  - name: API_HMPPS_USER_PREFERENCE_ENDPOINT_URL
    value: {{ .Values.env.API_HMPPS_USER_PREFERENCE_ENDPOINT_URL | quote }}    

  - name: API_PRISONER_OFFENDER_SEARCH_ENDPOINT_URL
    value: {{ .Values.env.API_PRISONER_OFFENDER_SEARCH_ENDPOINT_URL | quote }}    

  - name: API_PRISON_REGISTER_ENDPOINT_URL
    value: {{ .Values.env.API_PRISON_REGISTER_ENDPOINT_URL | quote }}

  - name: REMOTE_AUTH_STRATEGY
    value: {{ .Values.env.REMOTE_AUTH_STRATEGY | quote }}

  - name: WEB_SESSION_TIMEOUT_IN_MINUTES
    value: {{ .Values.env.WEB_SESSION_TIMEOUT_IN_MINUTES | quote }}

  - name: VIDEO_LINK_ENABLED_FOR
    value: {{ .Values.env.VIDEO_LINK_ENABLED_FOR | quote }}

  - name: HMPPS_COOKIE_NAME
    value: {{ .Values.env.HMPPS_COOKIE_NAME | quote }}

  - name: HMPPS_COOKIE_DOMAIN
    value: {{ .Values.ingress.host | quote }}

  - name: TOKENVERIFICATION_API_URL
    value: {{ .Values.env.TOKENVERIFICATION_API_URL | quote }}

  - name: TOKENVERIFICATION_API_ENABLED
    value: {{ .Values.env.TOKENVERIFICATION_API_ENABLED | quote }}

  - name: NODE_ENV
    value: production

  - name: REDIS_ENABLED
    value: {{ .Values.env.REDIS_ENABLED | quote }}
  
  - name: SERVICE_IS_UNAVAILABLE
    value: {{ .Values.env.SERVICE_IS_UNAVAILABLE | quote }}

  - name: GOOGLE_SERVICE_ACCOUNT_KEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: GOOGLE_SERVICE_ACCOUNT_KEY

  - name: VLBEVENT_EXPORT_SPREADSHEET_ID
    value: {{ .Values.env.VLBEVENT_EXPORT_SPREADSHEET_ID }}
{{- end -}}
