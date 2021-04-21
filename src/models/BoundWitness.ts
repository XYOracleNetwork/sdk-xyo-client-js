//XyoBoundWitnessJson is an envelope for a payload
//addesses are the addresses of the witnesses
//signatures are the signature of the witnesses
//hashes are the previous block hashes for each witness
//the number of addresses and signatures must match
//the _hash is the hash of the payload and addresses together
//the _signatures sign the hash

//note: we always use SHA256 hash

interface XyoBoundWitnessMetaJson {
  _client?: string
  _hash?: string
  _payloads?: Record<string, any>[]
  _signatures?: string[]
}

interface XyoBoundWitnessBodyJson {
  addresses: string[]
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
}

type WithXyoBoundWitnessMeta<T extends XyoBoundWitnessBodyJson> = T & XyoBoundWitnessMetaJson

type XyoBoundWitnessJson = WithXyoBoundWitnessMeta<XyoBoundWitnessBodyJson>

export type { WithXyoBoundWitnessMeta, XyoBoundWitnessBodyJson, XyoBoundWitnessJson, XyoBoundWitnessMetaJson }
