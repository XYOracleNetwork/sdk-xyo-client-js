import { Payload } from '@xyo-network/payload-model'

/** @deprecated Use from @xyo-network/payload-mongodb [Only for Mongo] */
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
