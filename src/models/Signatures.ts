interface XyoSignaturesJson {
  _signatures?: string[]
}

type WithXyoSignatures<T> = T & XyoSignaturesJson

export type { WithXyoSignatures, XyoSignaturesJson }
