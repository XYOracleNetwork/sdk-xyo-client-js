import { XyoModuleParams } from '@xyo-network/module'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoPentairScreenlogicPayload } from './Payload'
import { XyoPentairScreenlogicSchema } from './Schema'
import { Controller } from './screenlogic'

export type XyoPentairScreenlogicWitnessConfigSchema = 'network.xyo.pentair.screenlogic.witness.config'
export const XyoPentairScreenlogicWitnessConfigSchema: XyoPentairScreenlogicWitnessConfigSchema = 'network.xyo.pentair.screenlogic.witness.config'

export interface PentairServer {
  address: string

  gatewayName: string
  gatewaySubtype: number
  gatewayType: number

  port: number
  type: number
}

export type XyoPentairScreenlogicWitnessConfig = XyoWitnessConfig<
  XyoPentairScreenlogicPayload,
  {
    schema: XyoPentairScreenlogicWitnessConfigSchema
  }
>

export class XyoPentairScreenlogicWitness extends AbstractWitness<XyoPentairScreenlogicPayload, XyoPentairScreenlogicWitnessConfig> {
  static override configSchema = XyoPentairScreenlogicWitnessConfigSchema
  static override targetSchema = XyoPentairScreenlogicSchema

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected controller = new Controller()

  static override async create(params?: XyoModuleParams<XyoPentairScreenlogicWitnessConfig>): Promise<XyoPentairScreenlogicWitness> {
    return (await super.create(params)) as XyoPentairScreenlogicWitness
  }

  override async observe(_fields?: Partial<XyoPentairScreenlogicPayload>[]): Promise<XyoPentairScreenlogicPayload[]> {
    const config = await this.controller.getPoolConfig()
    const status = await this.controller.getPoolStatus()
    return await super.observe([{ config, status }] as XyoPentairScreenlogicPayload[])
  }
}
