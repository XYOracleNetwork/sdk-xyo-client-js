type PayloadObject = Record<string, unknown>

interface XyoPayload extends PayloadObject {
  schema?: string
}

export default XyoPayload
