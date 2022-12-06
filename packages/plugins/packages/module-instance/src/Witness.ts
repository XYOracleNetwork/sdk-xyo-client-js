import { XyoModule, XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'
import merge from 'lodash/merge'

import { XyoModuleInstanceSchema } from './Schema'

export type XyoModuleInstanceWitnessConfigSchema = 'network.xyo.module.instance.config'
export const XyoModuleInstanceWitnessConfigSchema: XyoModuleInstanceWitnessConfigSchema = 'network.xyo.module.instance.config'

export type XyoModuleInstanceWitnessConfig = XyoWitnessConfig<{
  module?: XyoModule
  schema: XyoModuleInstanceWitnessConfigSchema
}>

export class XyoModuleInstanceWitness extends AbstractWitness<XyoModuleInstanceWitnessConfig> {
  static override configSchema = XyoModuleInstanceWitnessConfigSchema

  protected get module() {
    return this.config?.module
  }

  static override async create(params?: XyoModuleParams<XyoModuleInstanceWitnessConfig>): Promise<XyoModuleInstanceWitness> {
    return (await super.create(params)) as XyoModuleInstanceWitness
  }

  override async observe(payloads?: Partial<XyoPayload>[]): Promise<XyoPayload[]> {
    return await super.observe([merge({ queries: this.module?.queries }, payloads?.[0], { schema: XyoModuleInstanceSchema })])
  }
}
