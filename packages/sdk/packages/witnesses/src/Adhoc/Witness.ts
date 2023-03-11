import { AnyConfigSchema } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessModule, WitnessParams, XyoWitnessConfig } from '@xyo-network/witness'
import merge from 'lodash/merge'

export type XyoAdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'
export const XyoAdhocWitnessConfigSchema: XyoAdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'

export type XyoAdhocWitnessConfig = XyoWitnessConfig<{
  payload?: XyoPayload
  schema: XyoAdhocWitnessConfigSchema
}>

export type XyoAdhocWitnessParams = WitnessParams<AnyConfigSchema<XyoAdhocWitnessConfig>>

export class XyoAdhocWitness<TParams extends XyoAdhocWitnessParams = XyoAdhocWitnessParams>
  extends AbstractWitness<TParams>
  implements WitnessModule
{
  static override configSchema: string = XyoAdhocWitnessConfigSchema

  get payload() {
    return this.config?.payload
  }

  static override async create<TParams extends XyoAdhocWitnessParams>(params?: TParams) {
    return await super.create(params)
  }

  override async observe(fields?: XyoPayload[]): Promise<XyoPayload[]> {
    const result: XyoPayload[] = await super.observe([merge({}, this.payload, fields?.[0])])

    return result.map((payload, index) => {
      return { ...payload, schema: fields?.[index]?.schema ?? payload.schema }
    })
  }
}
