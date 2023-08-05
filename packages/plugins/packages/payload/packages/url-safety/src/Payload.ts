import { Payload } from '@xyo-network/payload-model'
import { UrlPayload } from '@xyo-network/url-payload-plugin'

import { UrlSafetySchema } from './Schema'

export type UrlSafetyThreatType = 'SOCIAL_ENGINEERING' | 'POTENTIALLY_HARMFUL_APPLICATION' | 'UNWANTED_SOFTWARE' | 'THREAT_TYPE_UNSPECIFIED'

export type UrlSafetyPayload = Payload<
  Omit<UrlPayload, 'schema'> & {
    threatTypes?: UrlSafetyThreatType[]
  },
  UrlSafetySchema
>
