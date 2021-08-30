interface XyoBoundWitnessBody {
  [index: string]: unknown
  addresses: string[]
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
}

export default XyoBoundWitnessBody
