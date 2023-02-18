import { ArchivingModuleConfig } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { WitnessModule } from '@xyo-network/witness'

export type SentinelConfigSchema = 'network.xyo.node.sentinel'
export const SentinelConfigSchema: SentinelConfigSchema = 'network.xyo.node.sentinel'

export type SentinelConfig<TConfig extends XyoPayload = XyoPayload> = AbstractModuleConfig<
  ArchivingModuleConfig & {
    onReportEnd?: (boundWitness?: XyoBoundWitness, errors?: Error[]) => void
    onReportStart?: () => void
    onWitnessReportEnd?: (witness: WitnessModule, error?: Error) => void
    onWitnessReportStart?: (witness: WitnessModule) => void
    witnesses?: string[]
  } & TConfig
>
