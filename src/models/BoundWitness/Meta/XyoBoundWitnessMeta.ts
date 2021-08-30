interface XyoBoundWitnessMeta {
  [index: string]: unknown
  _client?: string
  _hash?: string
  _archive?: string
  _payloads?: Record<string, unknown>[]
  _signatures?: string[]
  _timestamp?: number
  _source_ip?: string
  _user_agent?: string
}

export default XyoBoundWitnessMeta
