import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessConfig, WitnessModule, WitnessParams } from '@xyo-network/witness'
import merge from 'lodash/merge'

export type AdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'
export const AdhocWitnessConfigSchema: AdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'

export type AdhocWitnessConfig = WitnessConfig<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Payload<any>
  schema: AdhocWitnessConfigSchema
}>

export type AdhocWitnessParams = WitnessParams<AnyConfigSchema<AdhocWitnessConfig>>

export class AdhocWitness<TParams extends AdhocWitnessParams = AdhocWitnessParams> extends AbstractWitness<TParams> implements WitnessModule {
  static override readonly configSchemas: string[] = [AdhocWitnessConfigSchema]

  get payload() {
    return this.config?.payload
  }

  override async observe(fields?: Payload[]): Promise<Payload[]> {
    const result: Payload[] = await super.observe([merge({}, this.payload, fields?.[0])])

    return result.map((payload, index) => {
      return { ...payload, schema: fields?.[index]?.schema ?? payload.schema }
    })
  }
}
