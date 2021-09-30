type PayloadObject = Record<string, unknown>

interface XyoPayload extends PayloadObject {
  _hash?: string
  schema?: string
}

export default XyoPayload
