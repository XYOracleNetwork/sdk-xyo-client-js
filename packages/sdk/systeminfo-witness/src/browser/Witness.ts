import { delay } from '@xylabs/delay'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoSystemInfoWitness } from '../shared'
import { observeBowser } from './observeBowser'
import { XyoSystemInfoBrowserPayload, XyoSystemInfoBrowserPayloadSchema } from './Payload'

export type XyoSystemInfoBrowserWitnessConfigSchema = 'network.xyo.system.info.browser.witness.config'
export const XyoSystemInfoBrowserWitnessConfigSchema: XyoSystemInfoBrowserWitnessConfigSchema = 'network.xyo.system.info.browser.witness.config'

export type XyoSystemInfoBrowserWitnessConfig<
  TSchema extends string = XyoSystemInfoBrowserWitnessConfigSchema,
  TTargetSchema extends string = XyoSystemInfoBrowserPayloadSchema,
  TConfig extends XyoPayload = XyoPayload,
> = XyoWitnessConfig<
  TTargetSchema,
  {
    schema: TSchema
    bowser?: Record<string, string>
  } & TConfig
>

export class XyoSystemInfoBrowserWitness<
  TSchema extends string = XyoSystemInfoBrowserWitnessConfigSchema,
  TTargetSchema extends string = XyoSystemInfoBrowserPayloadSchema,
  TPayload extends XyoSystemInfoBrowserPayload<TSchema> = XyoSystemInfoBrowserPayload<TSchema>,
  TConfig extends XyoSystemInfoBrowserWitnessConfig<TSchema, TTargetSchema> = XyoSystemInfoBrowserWitnessConfig<TSchema, TTargetSchema>,
> extends XyoSystemInfoWitness<TSchema, TPayload, TConfig> {
  override async observe(_fields?: Partial<TPayload>) {
    await delay(0)
    const bowser = observeBowser()
    return super.observe({ bowser } as TPayload)
  }
}
