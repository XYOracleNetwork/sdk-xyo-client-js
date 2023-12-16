import { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfig, WitnessConfigSchema, WitnessModule, WitnessParams } from '@xyo-network/witness-model'

/** @deprecated use from @xyo-network/witness-adhoc instead */
export type AdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'

/** @deprecated use from @xyo-network/witness-adhoc instead */
export const AdhocWitnessConfigSchema: AdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'

/** @deprecated use from @xyo-network/witness-adhoc instead */
export type AdhocWitnessConfig = WitnessConfig<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Payload<any>
  schema: AdhocWitnessConfigSchema
}>

/** @deprecated use from @xyo-network/witness-adhoc instead */
export type AdhocWitnessParams = WitnessParams<AnyConfigSchema<AdhocWitnessConfig>>

/** @deprecated use from @xyo-network/witness-adhoc instead */
export class AdhocWitness<TParameters extends AdhocWitnessParams = AdhocWitnessParams> extends AbstractWitness<TParameters> implements WitnessModule {
  static override readonly configSchemas: string[] = [AdhocWitnessConfigSchema, WitnessConfigSchema]

  get payload() {
    return this.config?.payload
  }

  protected override observeHandler(payloads?: Payload[]): Promisable<Payload[]> {
    const configPayloads = this.payload ? [this.payload] : []
    const inPayloads = payloads ?? []
    return [...configPayloads, ...inPayloads]
  }
}
