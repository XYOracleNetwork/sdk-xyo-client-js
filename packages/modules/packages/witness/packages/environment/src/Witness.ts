import { JsonValue } from '@xylabs/object'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Payload, Schema } from '@xyo-network/payload-model'
import { Value, ValueSchema } from '@xyo-network/value-payload-plugin'

import { EnvironmentWitnessConfigSchema } from './Config'
import { EnvironmentWitnessParams } from './Params'
import { EnvironmentSubset, isEnvironmentSubsetPayload } from './Payload'

const schema = ValueSchema

export class EnvironmentWitness<P extends EnvironmentWitnessParams = EnvironmentWitnessParams> extends AbstractWitness<P> {
  static override configSchemas: Schema[] = [...super.configSchemas, EnvironmentWitnessConfigSchema]
  static override defaultConfigSchema: Schema = EnvironmentWitnessConfigSchema
  protected override observeHandler(payloads?: Payload[]): Payload[] {
    const subsets = payloads?.filter(isEnvironmentSubsetPayload) ?? [undefined]
    return subsets.map(getEnv)
  }
}

const getEnv = (payload?: EnvironmentSubset): Value => {
  const subset = payload?.values
  const env = (subset ? Object.fromEntries(subset.map((key) => [key, process.env[key]])) : process.env) as JsonValue
  return { schema, value: env }
}
