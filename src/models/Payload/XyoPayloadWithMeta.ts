import XyoPayload from './XyoPayload'

interface XyoPayloadWithMeta extends XyoPayload {
  _hash?: string
  _timestamp?: number
  _archive?: string
}

export default XyoPayloadWithMeta
