import { ArchivingModule } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { SentinelConfig } from './Config'

export interface Sentinel {
  report: (payloads?: XyoPayload[]) => Promisable<[XyoBoundWitness, XyoPayload[]]>
  tryReport: (payloads?: XyoPayload[]) => Promisable<[XyoBoundWitness | null, XyoPayload[]]>
}

export interface SentinelModule<TConfig extends SentinelConfig = SentinelConfig> extends ArchivingModule<TConfig>, Sentinel {}
