import type { Promisable } from '@xylabs/sdk-js'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import type { AnyConfigSchema } from '@xyo-network/module-model'
import type { Payload, Schema } from '@xyo-network/payload-model'
import type {
  WitnessConfig, WitnessModule, WitnessParams,
} from '@xyo-network/witness-model'

export const AdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config' as const
export type AdhocWitnessConfigSchema = typeof AdhocWitnessConfigSchema

export type AdhocWitnessConfig = WitnessConfig<{

  payload?: Payload
  schema: AdhocWitnessConfigSchema
}>

export type AdhocWitnessParams = WitnessParams<AnyConfigSchema<AdhocWitnessConfig>>

export class AdhocWitness<TParams extends AdhocWitnessParams = AdhocWitnessParams> extends AbstractWitness<TParams> implements WitnessModule {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, AdhocWitnessConfigSchema]
  static override readonly defaultConfigSchema: Schema = AdhocWitnessConfigSchema

  get payload() {
    return this.config?.payload
  }

  protected override observeHandler(payloads?: Payload[]): Promisable<Payload[]> {
    const configPayloads = this.payload ? [this.payload] : []
    return [...configPayloads, ...(payloads ?? [])]
  }
}
