import { WithAdditional } from '@xyo-network/core'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload, XyoPayloadSchema } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'
import merge from 'lodash/merge'

export type XyoAdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'
export const XyoAdhocWitnessConfigSchema: XyoAdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'

export type XyoAdhocWitnessConfig = XyoWitnessConfig<
  WithAdditional<XyoPayload>,
  {
    payload: WithAdditional<XyoPayload>
    schema: XyoAdhocWitnessConfigSchema
  }
>

export class XyoAdhocWitness<T extends XyoPayload = WithAdditional<XyoPayload>> extends XyoWitness<T, XyoAdhocWitnessConfig> {
  static override configSchema = XyoAdhocWitnessConfigSchema
  static override targetSchema = XyoPayloadSchema

  get payload() {
    return this.config?.payload
  }

  static override async create(params: XyoModuleParams<XyoAdhocWitnessConfig>): Promise<XyoAdhocWitness> {
    params?.logger?.debug(`params: ${JSON.stringify(params, null, 2)}`)
    const module = new XyoAdhocWitness(params)
    await module.start()
    return module
  }

  override async observe(fields?: Partial<T>[]): Promise<T[]> {
    const result: T[] = await super.observe([merge({}, this.payload, fields?.[0])])

    return result.map((payload, index) => {
      return { ...payload, schema: fields?.[index].schema ?? payload.schema }
    })
  }
}
