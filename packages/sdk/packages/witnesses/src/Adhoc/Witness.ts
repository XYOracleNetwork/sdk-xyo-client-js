import { WithAdditional } from '@xyo-network/core'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'
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
  get payload() {
    return this.config?.payload
  }

  static override async create(params?: XyoModuleParams): Promise<XyoAdhocWitness> {
    const module = new XyoAdhocWitness(params as XyoModuleParams<XyoAdhocWitnessConfig>)
    await module.start()
    return module
  }

  override observe(fields?: Partial<T>[]): Promisable<T[]> {
    return super.observe([merge({}, this.payload, fields?.[0])])
  }
}
