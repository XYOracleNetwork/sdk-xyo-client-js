import { XyoApiConfig } from '@xyo-network/api-models'

export const getApiConfig = (): XyoApiConfig => {
  return {
    apiDomain: process.env.ARCHIVIST_API_DOMAIN || 'https://beta.api.archivist.xyo.network',
    apiKey: process.env.ARCHIVIST_API_KEY,
  }
}
