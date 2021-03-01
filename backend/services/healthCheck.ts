import { readFileSync } from 'fs'
import { serviceCheckFactory } from '../api/healthCheck'

const loadBuildInfo = () => {
  try {
    return JSON.parse(readFileSync('../../build-info.json').toString())
  } catch (e) {
    return undefined
  }
}

const buildInformation = loadBuildInfo()

type Service = { name: string; url: string }

type Status = 'UP' | 'DOWN' | 'ERROR'
type ServiceCheckResult = { name: string; status: Status; message: string | Error }
export type Result = { name: string; status: Status; api: ServiceCheckResult[] }

const serviceCheck = ({ name, url }: Service): (() => Promise<ServiceCheckResult>) => {
  const healthUrl = `${url.replace(/\/$/, '')}/health/ping`
  const check = serviceCheckFactory(name, healthUrl)
  return () =>
    check()
      .then(result => ({ name, status: 'UP' as const, message: result }))
      .catch(err => ({ name, status: 'ERROR' as const, message: err }))
}

const gatherCheckInfo = (total, currentValue) => ({ ...total, [currentValue.name]: currentValue.message })

const addAppInfo = result => {
  const buildInfo = {
    uptime: process.uptime(),
    build: buildInformation,
    version: (buildInformation && buildInformation.buildNumber) || 'Not available',
  }

  return { ...result, ...buildInfo }
}

type Callback = (error: Error, data: Result) => void

export default function healthcheckFactory(services: Service[]): (callback: Callback) => void {
  const checks = services.map(check => serviceCheck(check))
  return (callback: Callback) =>
    Promise.all(checks.map(fn => fn())).then(checkResults => {
      const allOk = checkResults.every(item => item.status === 'UP') ? 'UP' : 'DOWN'
      const result = {
        name: 'book-video-link',
        status: allOk,
        api: checkResults.reduce(gatherCheckInfo, {}),
      }
      callback(null, addAppInfo(result))
    })
}
