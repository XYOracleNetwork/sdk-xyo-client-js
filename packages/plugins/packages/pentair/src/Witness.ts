import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoPentairScreenlogicPayload } from './Payload'
import { XyoPentairScreenlogicSchema } from './Schema'
import { Controller } from './screenlogic'

export type XyoPentairScreenlogicWitnessConfigSchema = 'network.xyo.pentair.screenlogic.witness.config'
export const XyoPentairScreenlogicWitnessConfigSchema: XyoPentairScreenlogicWitnessConfigSchema = 'network.xyo.pentair.screenlogic.witness.config'

export interface PentairServer {
  address: string
  type: number
  port: number
  gatewayType: number
  gatewaySubtype: number
  gatewayName: string
}

export type XyoPentairScreenlogicWitnessConfig = XyoWitnessConfig<
  XyoPentairScreenlogicPayload,
  {
    schema: XyoPentairScreenlogicWitnessConfigSchema
  }
>

export class XyoPentairScreenlogicWitness extends XyoWitness<XyoPentairScreenlogicPayload, XyoPentairScreenlogicWitnessConfig> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected controller = new Controller()

  override async observe(_fields?: Partial<XyoPentairScreenlogicPayload>[]): Promise<XyoPentairScreenlogicPayload[]> {
    const config = await this.controller.getPoolConfig()
    const status = await this.controller.getPoolStatus()
    return await super.observe([{ config, status }] as XyoPentairScreenlogicPayload[])
  }

  static override async create(params?: XyoModuleParams<XyoPentairScreenlogicWitnessConfig>): Promise<XyoPentairScreenlogicWitness> {
    params?.logger?.debug(`params: ${JSON.stringify(params, null, 2)}`)
    const module = new XyoPentairScreenlogicWitness(params)
    await module.start()
    return module
  }

  static schema: XyoPentairScreenlogicSchema = XyoPentairScreenlogicSchema
}
