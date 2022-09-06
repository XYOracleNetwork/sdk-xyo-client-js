import { XyoAccount } from '@xyo-network/account'
import { XyoPayload } from '@xyo-network/payload'

import { Module } from './Module'

export type XyoModuleConfigSchema = 'network.xyo.module.config'
export const XyoModuleConfigSchema: XyoModuleConfigSchema = 'network.xyo.module.config'

export type XyoModuleConfig<TConfig extends XyoPayload = XyoPayload> = XyoPayload<
  TConfig & {
    account: XyoAccount
    resolver?: (address: string) => Module
  },
  TConfig['schema']
>
