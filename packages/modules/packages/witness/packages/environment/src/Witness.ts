import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfigSchema } from '@xyo-network/witness-model'

import { EnvironmentWitnessConfigSchema } from './Config'
import { EnvironmentWitnessParams } from './Params'
import { Environment, EnvironmentSchema, EnvironmentSubset, isEnvironmentSubsetPayload } from './Payload'

const schema = EnvironmentSchema

export class EnvironmentWitness<P extends EnvironmentWitnessParams = EnvironmentWitnessParams> extends AbstractWitness<P> {
  static override configSchemas = [EnvironmentWitnessConfigSchema, WitnessConfigSchema]
  protected override observeHandler(payloads?: Payload[]): Payload[] {
    const subsets = payloads?.filter(isEnvironmentSubsetPayload) ?? [undefined]
    return subsets.map(getEnv)
  }
}

const getEnv = (payload?: EnvironmentSubset): Environment => {
  const subset = payload?.values
  const env = subset ? subset.reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {}) : process.env
  return { env, schema }
}
