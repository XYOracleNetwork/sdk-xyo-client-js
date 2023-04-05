import { Payload } from '@xyo-network/payload-model'

export interface PayloadMetaBase {
  _archive?: string
  _client?: string
  _hash: string
  _observeDuration?: number
  _reportedHash?: string
  _schemaValid?: boolean
  _sources?: Payload[]
  _timestamp: number
  _user_agent?: string
}
