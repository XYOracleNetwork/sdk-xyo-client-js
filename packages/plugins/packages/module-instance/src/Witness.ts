import { XyoModule } from '@xyo-network/module'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'
import merge from 'lodash/merge'

import { XyoModuleInstancePayload } from './Payload'
import { XyoModuleInstanceSchema } from './Schema'

export type XyoModuleInstanceWitnessConfigSchema = 'network.xyo.module.instance.config'
export const XyoModuleInstanceWitnessConfigSchema: XyoModuleInstanceWitnessConfigSchema = 'network.xyo.module.instance.config'

export type XyoModuleInstanceWitnessConfig = XyoWitnessConfig<
  XyoModuleInstancePayload,
  {
    schema: XyoModuleInstanceWitnessConfigSchema
    module?: XyoModule
  }
>

export class XyoModuleInstanceWitness extends XyoWitness<XyoModuleInstancePayload, XyoModuleInstanceWitnessConfig> {
  protected get module() {
    return this.config?.module
  }

  override async observe(fields?: Partial<XyoModuleInstancePayload>[]): Promise<XyoModuleInstancePayload[]> {
    return await super.observe([merge({ queries: this.module?.queries }, fields?.[0])])
  }

  static schema: XyoModuleInstanceSchema = XyoModuleInstanceSchema
}
