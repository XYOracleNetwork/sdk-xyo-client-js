interface XyoBoundWitnessBody {
  addresses: string[]
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
}

export default XyoBoundWitnessBody
