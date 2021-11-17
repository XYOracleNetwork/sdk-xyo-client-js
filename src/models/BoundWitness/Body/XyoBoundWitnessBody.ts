interface XyoBoundWitnessBody {
  [key: string]: unknown
  addresses: string[]
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
}

export type { XyoBoundWitnessBody }
