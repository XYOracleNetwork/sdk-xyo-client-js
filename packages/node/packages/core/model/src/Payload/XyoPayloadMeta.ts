import { XyoPayload } from '@xyo-network/payload-model'

export interface XyoPayloadMetaBase {
  _archive?: string
  _client?: string
  _hash: string
  _observeDuration?: number
  _reportedHash?: string
  _schemaValid?: boolean
  _sources?: XyoPayload[]
  _timestamp: number
  _user_agent?: string
}
