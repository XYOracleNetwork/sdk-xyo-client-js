import { AxiosJson } from '@xyo-network/axios'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'
import { UrlSafetyPayload } from '@xyo-network/url-safety-payload-plugin'
import { AbstractWitness } from '@xyo-network/witness'

import { UrlSafetyWitnessConfigSchema } from './Config'
import { UrlSafetyWitnessParams } from './Params'

const checkUrlSafety = async (
  urls: string[],
  config?: {
    endPoint?: string
    key?: string
  },
): Promise<UrlSafetyPayload[]> => {
  const axios = new AxiosJson()
  const endPoint = config?.endPoint ?? 'https://safebrowsing.googleapis.com/v5/threatMatches:find'
  const key = config?.key
  const mutatedUrls = urls.map((url) => url.replace('ipfs://', 'https://cloudflare-ipfs.com/'))
  if (mutatedUrls.length === 0) {
    return []
  }
  const postData = {
    client: {
      clientId: 'foreventory',
      clientVersion: '1.0',
    },
    threatInfo: {
      platformTypes: ['WINDOWS', 'LINUX', 'OSX'],
      threatEntries: mutatedUrls.map((url) => ({ url })),
      threatEntryTypes: ['URL'],
      threatTypes: ['SOCIAL_ENGINEERING', 'POTENTIALLY_HARMFUL_APPLICATION', 'UNWANTED_SOFTWARE', 'THREAT_TYPE_UNSPECIFIED'],
    },
  }
  const result = (await axios.post(`${endPoint}?key=${key}`, postData)).data
  console.log(`checkUrlSafety: ${JSON.stringify(result, null, 2)}`)
  return []
}

export class UrlWitness<TParams extends UrlSafetyWitnessParams = UrlSafetyWitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [UrlSafetyWitnessConfigSchema]

  get urls() {
    return this.config?.urls
  }

  protected override async observeHandler(payloads: UrlPayload[] = []): Promise<UrlSafetyPayload[]> {
    const urls: string[] =
      this.urls ??
      payloads
        .filter((p): p is UrlPayload => p.schema === UrlSchema)
        .map((p) => {
          return p.url
        })

    return await checkUrlSafety(urls)
  }
}
