import { XyoPayload } from '@xyo-network/payload-model'

import { XyoPayloadWithMeta } from '../Payload'
import { Query } from './Query'

export type GetDomainConfigSchema = 'network.xyo.domain.get'
export const GetDomainConfigSchema: GetDomainConfigSchema = 'network.xyo.domain.get'

export interface GetDomainConfig {
  domain: string
  proxy?: string
  schema: GetDomainConfigSchema
}

export type GetDomainConfigPayload = XyoPayload<GetDomainConfig>
export type GetDomainConfigPayloadWithMeta = XyoPayloadWithMeta<GetDomainConfig>

export class GetDomainConfigQuery extends Query<GetDomainConfigPayload> {}
