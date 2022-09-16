import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness'

const testBoundWitness: XyoBoundWitness = {
  _archive: 'temp',
  _client: 'js',
  _hash: 'b0ffb9ebf872dc316b7be48327256c5316f7cb84d7c706861b18b86af1942dea',
  _signatures: ['95100e5fd2012b958e96895870cfac5353c3a33a19314cfd1304ef7d01d052ec2a3ef80d6449cf88d463027fe0d868ed8cfb8b7323d37e93a08570233eea0b17'],
  _timestamp: 1650067385598,
  addresses: ['5346a2ce56ec4177b67092bda710e150ba6fa046'],
  payload_hashes: ['20e14207f952a09f767ff614a648546c037fe524ace0bfe55db31f818aff1f1c'],
  payload_schemas: ['network.xyo.test'],
  previous_hashes: [null],
  schema: XyoBoundWitnessSchema,
} as XyoBoundWitness

export { testBoundWitness }
