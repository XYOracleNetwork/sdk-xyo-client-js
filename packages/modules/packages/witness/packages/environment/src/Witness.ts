import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Payload } from '@xyo-network/payload-model'
import { Values, ValuesSchema } from '@xyo-network/values-payload-plugin'
import { WitnessConfigSchema } from '@xyo-network/witness-model'

import { EnvironmentWitnessConfigSchema } from './Config'
import { EnvironmentWitnessParams } from './Params'
import { EnvironmentSubset, isEnvironmentSubsetPayload } from './Payload'

const schema = ValuesSchema

export class EnvironmentWitness<P extends EnvironmentWitnessParams = EnvironmentWitnessParams> extends AbstractWitness<P> {
  static override configSchemas = [EnvironmentWitnessConfigSchema, WitnessConfigSchema]
  protected override observeHandler(payloads?: Payload[]): Payload[] {
    const subsets = payloads?.filter(isEnvironmentSubsetPayload) ?? [undefined]
    return subsets.map(getEnv)
  }
}

const getEnv = (payload?: EnvironmentSubset): Values => {
  const subset = payload?.values
  const env = subset ? subset.reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {}) : process.env
  return { schema, values: env }
}
