import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { it } from 'vitest'

const testBoundWitness: BoundWitness = {
  $signatures: ['95100e5fd2012b958e96895870cfac5353c3a33a19314cfd1304ef7d01d052ec2a3ef80d6449cf88d463027fe0d868ed8cfb8b7323d37e93a08570233eea0b17'],
  addresses: ['5346a2ce56ec4177b67092bda710e150ba6fa046'],
  payload_hashes: ['20e14207f952a09f767ff614a648546c037fe524ace0bfe55db31f818aff1f1c'],
  payload_schemas: ['network.xyo.test'],
  previous_hashes: [null],
  schema: BoundWitnessSchema,
} as BoundWitness

// eslint-disable-next-line sonarjs/assertions-in-tests
it('no test', () => {})

export { testBoundWitness }
