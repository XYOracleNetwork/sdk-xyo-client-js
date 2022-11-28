import { XyoModule, XyoModuleParams } from '@xyo-network/module'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'
import merge from 'lodash/merge'

import { XyoModuleInstancePayload } from './Payload'
import { XyoModuleInstanceSchema } from './Schema'

export type XyoModuleInstanceWitnessConfigSchema = 'network.xyo.module.instance.config'
export const XyoModuleInstanceWitnessConfigSchema: XyoModuleInstanceWitnessConfigSchema = 'network.xyo.module.instance.config'

export type XyoModuleInstanceWitnessConfig = XyoWitnessConfig<
  XyoModuleInstancePayload,
  {
    module?: XyoModule
    schema: XyoModuleInstanceWitnessConfigSchema
  }
>

export class XyoModuleInstanceWitness extends AbstractWitness<XyoModuleInstancePayload, XyoModuleInstanceWitnessConfig> {
  static override configSchema = XyoModuleInstanceWitnessConfigSchema
  static override targetSchema = XyoModuleInstanceSchema

  protected get module() {
    return this.config?.module
  }

  static override async create(params?: XyoModuleParams<XyoModuleInstanceWitnessConfig>): Promise<XyoModuleInstanceWitness> {
    return (await super.create(params)) as XyoModuleInstanceWitness
  }

  override async observe(fields?: Partial<XyoModuleInstancePayload>[]): Promise<XyoModuleInstancePayload[]> {
    return await super.observe([merge({ queries: this.module?.queries }, fields?.[0])])
  }
}
