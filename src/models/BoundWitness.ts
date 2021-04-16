//XyoBoundWitnessJson is an envelope for a payload
//addesses are the addresses of the witnesses
//signatures are the signature of the witnesses
//hashes are the previous block hashes for each witness
//the number of addresses and signatures must match
//the _hash is the hash of the payload and addresses together
//the _signatures sign the hash

//note: we always use SHA256 hash

interface XyoBoundWitnessMetaJson {
  _hash?: string
  _signatures?: string[]
}

interface XyoBoundWitnessBodyJson<T> {
  addresses: string[]
  hashes: (string | null)[]
  payload: T
}

type WithXyoBoundWitnessMeta<L extends XyoBoundWitnessBodyJson<unknown>> = L & XyoBoundWitnessMetaJson

type XyoBoundWitnessJson<T> = WithXyoBoundWitnessMeta<XyoBoundWitnessBodyJson<T>>

export type { WithXyoBoundWitnessMeta, XyoBoundWitnessBodyJson, XyoBoundWitnessJson, XyoBoundWitnessMetaJson }
