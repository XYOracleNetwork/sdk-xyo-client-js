import { assertEx } from '@xylabs/assert'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, WitnessConfig, WitnessConfigSchema, WitnessModule, WitnessParams } from '@xyo-network/witness'

export type AdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'
export const AdhocWitnessConfigSchema: AdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'

export type AdhocWitnessConfig = WitnessConfig<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Payload<any>
  schema: AdhocWitnessConfigSchema
}>

export type AdhocWitnessParams = WitnessParams<AnyConfigSchema<AdhocWitnessConfig>>

export class AdhocWitness<TParams extends AdhocWitnessParams = AdhocWitnessParams> extends AbstractWitness<TParams> implements WitnessModule {
  static override readonly configSchemas: string[] = [AdhocWitnessConfigSchema, WitnessConfigSchema]

  get payload() {
    return this.config?.payload
  }

  protected override observeHandler(payloads?: Payload[]): Promisable<Payload[]> {
    return payloads ?? [assertEx(this.config.payload, 'AdhocWitness asked to witness no payload without a default payload in config')]
  }
}
