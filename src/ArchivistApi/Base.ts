import axios, { AxiosRequestConfig } from 'axios'

import { XyoArchivistApiConfig } from './Config'
import { getArchivistApiResponseTransformer } from './responseTransformer'

export class XyoArchivistApiBase {
  public config: XyoArchivistApiConfig
  constructor(config: XyoArchivistApiConfig) {
    this.config = config
  }

  protected get axios() {
    return this.config.axios ?? axios
  }

  protected get axiosRequestConfig(): AxiosRequestConfig {
    return (
      this.config.axiosRequestConfig ?? {
        headers: this.headers,
        transformResponse: getArchivistApiResponseTransformer(),
      }
    )
  }

  protected get headers(): Record<string, string> {
    const headers: Record<string, string> = {}
    if (this.config.jwtToken) {
      headers.Authorization = `Bearer ${this.config.jwtToken}`
    }
    if (this.config.apiKey) {
      headers['x-api-key'] = this.config.apiKey
    }
    return headers
  }

  public get authenticated() {
    return !!this.config.apiKey || !!this.config.jwtToken
  }

  public get archiveName() {
    return this.config.archive
  }
}
