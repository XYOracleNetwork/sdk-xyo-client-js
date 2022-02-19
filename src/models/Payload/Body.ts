interface XyoPayloadBody {
  [key: string]: unknown
  schema: string
  previousHash?: string
}

export type { XyoPayloadBody }
