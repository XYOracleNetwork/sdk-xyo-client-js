import { Payload } from '@xyo-network/payload-model'

/** @deprecated This type will be moved to mongodb specific package soon */
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
