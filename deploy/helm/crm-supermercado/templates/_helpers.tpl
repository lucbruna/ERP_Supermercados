{{/*
Expand the name of the chart.
*/}}
{{- define "crm.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "crm.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "crm.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "crm.labels" -}}
helm.sh/chart: {{ include "crm.chart" . }}
{{ include "crm.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "crm.selectorLabels" -}}
app.kubernetes.io/name: {{ include "crm.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "crm.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "crm.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Backend service labels
*/}}
{{- define "crm.backend.labels" -}}
app.kubernetes.io/component: backend
app.kubernetes.io/part-of: crm-supermercado
{{- end -}}

{{/*
Frontend service labels
*/}}
{{- define "crm.frontend.labels" -}}
app.kubernetes.io/component: frontend
app.kubernetes.io/part-of: crm-supermercado
{{- end -}}

{{/*
Database service labels
*/}}
{{- define "crm.database.labels" -}}
app.kubernetes.io/component: database
app.kubernetes.io/part-of: crm-supermercado
{{- end -}}

{{/*
Image reference helper
*/}}
{{- define "crm.image" -}}
{{- $registryName := .Values.global.imageRegistry -}}
{{- $imageName := .image -}}
{{- $tag := .tag | default .Chart.AppVersion -}}
{{- if $registryName }}
{{- printf "%s/%s:%s" $registryName $imageName $tag -}}
{{- else }}
{{- printf "%s:%s" $imageName $tag -}}
{{- end }}
{{- end -}}

{{/*
Environment variables from secret
*/}}
{{- define "crm.secretEnv" -}}
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: crm-secrets
      key: database-url
- name: REDIS_HOST
  value: {{ .Values.redis.fullnameOverride | default "redis" }}
- name: REDIS_PORT
  value: "6379"
{{- end -}}

{{/*
Probe configuration
*/}}
{{- define "crm.probes" -}}
{{- if .probe.enabled }}
livenessProbe:
  httpGet:
    path: {{ .probe.path }}
    port: {{ .containerPort }}
  initialDelaySeconds: {{ .probe.initialDelaySeconds | default 15 }}
  periodSeconds: {{ .probe.periodSeconds | default 15 }}
readinessProbe:
  httpGet:
    path: {{ .probe.path }}
    port: {{ .containerPort }}
  initialDelaySeconds: {{ .probe.initialDelaySeconds | default 5 }}
  periodSeconds: {{ .probe.periodSeconds | default 10 }}
{{- end }}
{{- end -}}
