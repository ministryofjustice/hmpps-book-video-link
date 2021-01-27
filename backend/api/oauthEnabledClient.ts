import superagent from 'superagent'
import Agent from 'agentkeepalive'
import logger from '../log'
import { getHeaders } from './axios-config-decorators'

const { HttpsAgent } = Agent
const resultLogger = result => {
  logger.debug(`${result.req.method} ${result.req.path} ${result.status}`)
  return result
}

const errorLogger = error => {
  const status = error.response ? error.response.status : '-'
  const responseData = error.response ? error.response.body : '-'
  const payload =
    typeof responseData === 'object' && responseData !== null ? JSON.stringify(responseData) : responseData

  // Not Found 404 is a valid response when querying for data.
  // Log it for information and pass it down the line
  // in case controllers want to do something specific.
  if (status === 404) {
    logger.warn(`${error.response.req.method} ${error.response.req.path} No record found`)
    return error
  }

  if (error.response && error.response.req) {
    logger.warn(
      `API error in ${error.response.req.method} ${error.response.req.path} ${status} ${error.message} ${payload}`
    )
  } else logger.warn(`API error with message ${error.message}`)
  return error
}

interface ClientOptions {
  baseUrl: string
  timeout: number
}

/**
 * Build a client for the supplied configuration. The client wraps axios get, post, put etc while ensuring that
 * the remote calls carry valid oauth headers.
 *
 * @param {Object} params The base url to be used with the client's get and post
 * @param {string} params.baseUrl The base url to be used with the client's get and post
 * @param {number} params.timeout The timeout to apply to get and post.
 * @returns { {
 *     get: (context: any, path: string, resultLimit?: number) => Promise<any>
 *     post: (context: any, path: string, body: any) => Promise<any>
 * }}
 */
export = class Client {
  constructor(private readonly options: ClientOptions) {}

  private baseUrl = this.options.baseUrl

  private timeout = this.options.timeout

  // strip off any excess / from the required url
  private remoteUrl = this.baseUrl.endsWith('/') ? this.baseUrl.substring(0, this.baseUrl.length - 1) : this.baseUrl

  private agentOptions = {
    maxSockets: 100,
    maxFreeSockets: 10,
    freeSocketTimeout: 30000,
  }

  private keepaliveAgent = this.remoteUrl.startsWith('https')
    ? new HttpsAgent(this.agentOptions)
    : new Agent(this.agentOptions)

  /**
   * A superagent GET request with Oauth token
   *
   * @param {any} context A request scoped context. Holds OAuth tokens and pagination information for the request
   * @param {string} path relative path to get, starting with /
   * @param {number} resultLimit - the maximum number of results that a Get request should return.  Becomes the value of the 'page-limit' request header.
   *        The header isn't set if resultLimit is falsy.
   * @returns {Promise<any>} A Promise which settles to the superagent result object if the promise is resolved, otherwise to the 'error' object.
   */
  public get(context: any, path: string, resultLimit?: number): Promise<superagent.Response> {
    return new Promise((resolve, reject) => {
      superagent
        .get(this.remoteUrl + path)
        .agent(this.keepaliveAgent)
        .set(getHeaders(context, resultLimit))
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout({ deadline: this.timeout / 3 })
        .end((error, response) => {
          if (error) reject(errorLogger(error))
          else if (response) resolve(resultLogger(response))
        })
    })
  }

  /**
   * An superagent POST with Oauth token refresh and retry behaviour
   * @param {any} context A request scoped context. Holds OAuth tokens and pagination information for the request
   * @param {string} path relative path to post to, starting with /
   * @param {any} body
   * @returns {any} A Promise which resolves to the superagent result object, or the superagent error object if it is rejected
   */
  public post(context: any, path: string, body: any): Promise<superagent.Response> {
    return new Promise((resolve, reject) => {
      superagent
        .post(this.remoteUrl + path)
        .send(body)
        .set(getHeaders(context))
        .end((error, response) => {
          if (error) reject(errorLogger(error))
          else if (response) resolve(resultLogger(response))
        })
    })
  }

  public put(context: any, path: string, body: any, contentType = 'application/json'): Promise<superagent.Response> {
    return new Promise((resolve, reject) => {
      superagent
        .put(this.remoteUrl + path)
        .send(body)
        .set(getHeaders(context))
        .set('Content-Type', contentType)
        .end((error, response) => {
          if (error) reject(errorLogger(error))
          else if (response) resolve(resultLogger(response))
        })
    })
  }

  public delete(context: any, path: string): Promise<superagent.Response> {
    return new Promise((resolve, reject) => {
      superagent
        .delete(this.remoteUrl + path)
        .set(getHeaders(context))
        .end((error, response) => {
          if (error) reject(errorLogger(error))
          else if (response) resolve(resultLogger(response))
        })
    })
  }
}
