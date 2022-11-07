import { XyoBoundWitness } from '@xyo-network/boundwitness'

// NOTE: Could use lodash.pick with the following array but
// destructuring, like we are below, is most likely more performant
// const scrubbedFields = ['_signatures', 'addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes', 'schema', 'timestamp']

export const scrubBoundWitnesses = (boundWitnesses: XyoBoundWitness[]) => {
  return boundWitnesses?.map((boundWitness) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _signatures, addresses, payload_hashes, payload_schemas, previous_hashes, schema, timestamp, ...props } = boundWitness
    return { _signatures, addresses, payload_hashes, payload_schemas, previous_hashes, schema, timestamp } as XyoBoundWitness
  })
}
