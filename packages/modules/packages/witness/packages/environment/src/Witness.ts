import type { JsonValue } from '@xylabs/object'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import type { Payload, Schema } from '@xyo-network/payload-model'
import type { Value } from '@xyo-network/value-payload-plugin'
import { ValueSchema } from '@xyo-network/value-payload-plugin'

import { EnvironmentWitnessConfigSchema } from './Config.ts'
import type { EnvironmentWitnessParams } from './Params.ts'
import type { EnvironmentSubset } from './Payload.ts'
import { isEnvironmentSubsetPayload } from './Payload.ts'

const schema = ValueSchema

export class EnvironmentWitness<P extends EnvironmentWitnessParams = EnvironmentWitnessParams> extends AbstractWitness<P> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, EnvironmentWitnessConfigSchema]
  static override readonly defaultConfigSchema: Schema = EnvironmentWitnessConfigSchema
  protected override observeHandler(payloads?: Payload[]): Payload[] {
    const subsets = payloads?.filter(isEnvironmentSubsetPayload) ?? [undefined]
    return subsets.map(getEnv)
  }
}

const getEnv = (payload?: EnvironmentSubset): Value => {
  const subset = payload?.values
  const env = (subset ? Object.fromEntries(subset.map(key => [key, process.env[key]])) : process.env) as JsonValue
  return { schema, value: env }
}
