import { ApiConfig } from '@xyo-network/api-models'

export const getApiConfig = (): ApiConfig => {
  return {
    apiDomain: process.env.ARCHIVIST_API_DOMAIN || 'https://beta.api.archivist.xyo.network',
  }
}
