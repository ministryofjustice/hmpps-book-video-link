import { config } from 'dotenv'
import { setup, defaultClient, TelemetryClient, DistributedTracingModes } from 'applicationinsights'
import ignoreNotFoundErrors from './telemetryProcessors/ignoreNotFound'
import applicationVersion from './application-version'

export const initialiseAppInsights = (name = defaultName()): void => {
  // Loads .env file contents into | process.env
  config()
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')
    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
    defaultClient.context.tags['ai.cloud.role'] = name
    defaultClient.context.tags['ai.application.ver'] = version()
    defaultClient.addTelemetryProcessor(ignoreNotFoundErrors)
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
