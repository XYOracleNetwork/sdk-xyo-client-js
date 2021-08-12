import { assertEx } from '@xyo-network/sdk-xyo-js'

import { XyoBoundWitnessBuilder } from '../BoundWitnessBuilder'
import { XyoBoundWitness } from '../models'

const validateBoundWitnessBodyHash = (bw: XyoBoundWitness) => {
  const body = {
    addresses: bw.addresses,
    payload_hashes: bw.payload_hashes,
    payload_schemas: bw.payload_schemas,
    previous_hashes: bw.previous_hashes,
  }

  const bodyHash = XyoBoundWitnessBuilder.hash(body)
  assertEx(bodyHash === bw._hash, `Body hash mismatch: [calculated: ${bodyHash}] [found: ${bw._hash}]`)
}

export default validateBoundWitnessBodyHash
