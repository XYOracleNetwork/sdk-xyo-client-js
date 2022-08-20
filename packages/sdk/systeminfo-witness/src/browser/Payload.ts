import { XyoPayload } from '@xyo-network/payload'
import { Parser } from 'bowser'

import { XyoSystemInfoPayload } from '../shared'

export type XyoSystemInfoBrowserPayloadSchema = 'network.xyo.system.info.browser'
export const XyoSystemInfoBrowserPayloadSchema: XyoSystemInfoBrowserPayloadSchema = 'network.xyo.system.info.browser'

export type XyoSystemInfoBrowserPayload<
  TSchema extends string = XyoSystemInfoBrowserPayloadSchema,
  T extends XyoPayload = XyoPayload,
> = XyoSystemInfoPayload<
  TSchema,
  {
    bowser?: Parser.ParsedResult
  } & T
>
