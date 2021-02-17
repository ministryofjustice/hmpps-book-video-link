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

  - name: API_SYSTEM_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_SYSTEM_CLIENT_ID

  - name: API_SYSTEM_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_SYSTEM_CLIENT_SECRET

  - name: APPINSIGHTS_INSTRUMENTATIONKEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: APPINSIGHTS_INSTRUMENTATIONKEY

  - name: GOOGLE_ANALYTICS_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: GOOGLE_ANALYTICS_ID

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

  - name: WANDSWORTH_OMU_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: WANDSWORTH_OMU_EMAIL

  - name: WANDSWORTH_VLB_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: WANDSWORTH_VLB_EMAIL

  - name: HEWELL_OMU_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: HEWELL_OMU_EMAIL

  - name: HEWELL_VLB_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: HEWELL_VLB_EMAIL

  - name: THAMESIDE_OMU_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: THAMESIDE_OMU_EMAIL

  - name: THAMESIDE_VLB_EMAIL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: THAMESIDE_VLB_EMAIL

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

  - name: API_PRISONER_OFFENDER_SEARCH_ENDPOINT_URL
    value: {{ .Values.env.API_PRISONER_OFFENDER_SEARCH_ENDPOINT_URL | quote }}    

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

  - name: SUPPORT_URL
    value: {{ .Values.env.SUPPORT_URL | quote }}

  - name: NODE_ENV
    value: production

  - name: REDIS_ENABLED
    value: {{ .Values.env.REDIS_ENABLED | quote }}

{{- end -}}
