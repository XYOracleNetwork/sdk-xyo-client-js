import { ApiConfig } from '@xyo-network/api-models'
import { uuid } from '@xyo-network/core'

import { ArchivistApi } from './Api'

test('Must have tests defined', () => {
  expect(true).toBeTruthy()
})

export const getApiConfig = (configData: Partial<ApiConfig> = {}): ApiConfig => {
  const apiDomain = process.env.API_DOMAIN || 'http://localhost:8080'
  const defaults: ApiConfig = {
    apiDomain,
    onError: (error) => error,
    onFailure: (response) => response,
    onSuccess: (response) => response,
  }
  return Object.assign({}, defaults, configData)
}

export const getApi = (configData: Partial<ApiConfig> = {}): ArchivistApi => {
  return new ArchivistApi(getApiConfig(configData))
}

export const testSchemaPrefix = 'network.xyo.schema.test.'
export const getSchemaName = (): string => {
  return `${testSchemaPrefix}${uuid()}`
}

export const getTimestampMinutesFromNow = (minutes = 0) => {
  const t = new Date()
  t.setMinutes(t.getMinutes() + minutes)
  return +t
}
