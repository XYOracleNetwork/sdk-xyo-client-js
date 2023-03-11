import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, Module, ModuleEventData, ModuleParams, WithAdditional } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { WitnessModule } from '@xyo-network/witness'

import { SentinelConfig } from './Config'

export interface Sentinel {
  report: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
}

export type SentinelParams<
  TConfig extends AnyConfigSchema<SentinelConfig> = SentinelConfig,
  TEventData extends ModuleEventData = ModuleEventData,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<
  TConfig,
  TEventData,
  WithAdditional<
    {
      onReportEnd?: (boundWitness?: XyoBoundWitness, errors?: Error[]) => void
      onReportStart?: () => void
      onWitnessReportEnd?: (witness: WitnessModule, error?: Error) => void
      onWitnessReportStart?: (witness: WitnessModule) => void
    },
    TAdditionalParams
  >
>

export type SentinelModule<TParams extends SentinelParams<AnyConfigSchema<SentinelConfig>> = SentinelParams<AnyConfigSchema<SentinelConfig>>> =
  Module<TParams> & Sentinel
