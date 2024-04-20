import { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload, Schema } from '@xyo-network/payload-model'
import { WitnessConfig, WitnessModule, WitnessParams } from '@xyo-network/witness-model'

export type AdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'
export const AdhocWitnessConfigSchema: AdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'

export type AdhocWitnessConfig = WitnessConfig<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Payload<any>
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
