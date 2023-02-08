import { WithAdditional } from '@xyo-network/core'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'
import merge from 'lodash/merge'

export type XyoAdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'
export const XyoAdhocWitnessConfigSchema: XyoAdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'

export type XyoAdhocWitnessConfig = XyoWitnessConfig<{
  payload: WithAdditional<XyoPayload>
  schema: XyoAdhocWitnessConfigSchema
}>

export class XyoAdhocWitness extends AbstractWitness<XyoAdhocWitnessConfig> {
  static override configSchema = XyoAdhocWitnessConfigSchema

  get payload() {
    return this.config?.payload
  }

  static override async create(params: ModuleParams<XyoAdhocWitnessConfig>): Promise<XyoAdhocWitness> {
    return (await super.create(params)) as XyoAdhocWitness
  }

  override async observe(fields?: XyoPayload[]): Promise<XyoPayload[]> {
    const result: XyoPayload[] = await super.observe([merge({}, this.payload, fields?.[0])])

    return result.map((payload, index) => {
      return { ...payload, schema: fields?.[index]?.schema ?? payload.schema }
    })
  }
}
