import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Payload } from '@xyo-network/payload-model'
import { Value, ValueSchema } from '@xyo-network/value-payload-plugin'
import { WitnessConfigSchema } from '@xyo-network/witness-model'

import { EnvironmentWitnessConfigSchema } from './Config'
import { EnvironmentWitnessParams } from './Params'
import { EnvironmentSubset, isEnvironmentSubsetPayload } from './Payload'

const schema = ValueSchema

export class EnvironmentWitness<P extends EnvironmentWitnessParams = EnvironmentWitnessParams> extends AbstractWitness<P> {
  static override configSchemas = [EnvironmentWitnessConfigSchema, WitnessConfigSchema]
  protected override observeHandler(payloads?: Payload[]): Payload[] {
    const subsets = payloads?.filter(isEnvironmentSubsetPayload) ?? [undefined]
    return subsets.map(getEnv)
  }
}

const getEnv = (payload?: EnvironmentSubset): Value => {
  const subset = payload?.values
  const env = subset ? subset.reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {}) : process.env
  return { schema, value: env }
}
