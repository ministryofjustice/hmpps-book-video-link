import { Contracts, setup, defaultClient, TelemetryClient, DistributedTracingModes } from 'applicationinsights'
import { EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts'
import applicationVersion from './application-version'

export type ContextObject = {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  [name: string]: any
}

export const initialiseAppInsights = (name = defaultName()): void => {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')
    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
    defaultClient.context.tags['ai.cloud.role'] = name
    defaultClient.context.tags['ai.application.ver'] = version()
    defaultClient.addTelemetryProcessor(addUserDataToRequests)
  }
}

const defaultName = (): string => {
  const {
    packageData: { name },
  } = applicationVersion
  return name
}

const version = (): string => {
  const { buildNumber } = applicationVersion
  return buildNumber
}

export const getInsightsClient = (): TelemetryClient => {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    return defaultClient
  }
  return null
}

export function addUserDataToRequests(envelope: EnvelopeTelemetry, contextObjects: ContextObject): boolean {
  const isRequest = envelope.data.baseType === Contracts.TelemetryTypeString.Request
  if (isRequest) {
    const { username } = contextObjects?.['http.ServerRequest']?.res?.locals?.user || {}
    if (username) {
      const { properties } = envelope.data.baseData
      // eslint-disable-next-line no-param-reassign
      envelope.data.baseData.properties = {
        username,
        ...properties,
      }
    }
  }
  return true
}
