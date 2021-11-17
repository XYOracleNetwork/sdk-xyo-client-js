import { XyoPayloadBody } from '../../Payload'

interface XyoBoundWitnessMeta {
  [key: string]: unknown
  _client?: string
  _hash?: string
  _archive?: string
  _payloads?: XyoPayloadBody[]
  _signatures?: string[]
  _timestamp?: number
  _source_ip?: string
  _user_agent?: string
}

export type { XyoBoundWitnessMeta }
