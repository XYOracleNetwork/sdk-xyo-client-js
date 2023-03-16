import { AbstractArchivist, ArchivingModule } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AnyConfigSchema } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessWrapper } from '@xyo-network/witness'
import uniq from 'lodash/uniq'

import { SentinelConfig, SentinelConfigSchema } from './Config'
import { SentinelReportQuerySchema } from './Queries'
import { SentinelModule, SentinelModuleEventData, SentinelParams } from './SentinelModel'

export abstract class AbstractSentinel<
    TParams extends SentinelParams<AnyConfigSchema<SentinelConfig>> = SentinelParams<SentinelConfig>,
    TEventData extends SentinelModuleEventData = SentinelModuleEventData,
  >
  extends ArchivingModule<TParams, TEventData>
  implements SentinelModule<TParams, TEventData>
{
  static override configSchema: SentinelConfigSchema

  history: XyoBoundWitness[] = []
  private _archivists: ArchivistWrapper[] | undefined
  private _witnesses: WitnessWrapper[] | undefined

  override get queries(): string[] {
    return [SentinelReportQuerySchema, ...super.queries]
  }

  addWitness(address: string[]) {
    this.config.witnesses = uniq([...address, ...(this.config.witnesses ?? [])])
    this._witnesses = undefined
  }

  async getArchivists() {
    const addresses = this.config?.archivists ? (Array.isArray(this.config.archivists) ? this.config?.archivists : [this.config.archivists]) : []
    this._archivists =
      this._archivists ||
      ((await this.resolve({ address: addresses })) as AbstractArchivist[]).map(
        (witness) => new ArchivistWrapper({ account: this.account, module: witness }),
      )

    return this._archivists
  }

  async getWitnesses() {
    const addresses = this.config?.witnesses ? (Array.isArray(this.config.witnesses) ? this.config?.witnesses : [this.config.witnesses]) : []
    this._witnesses =
      this._witnesses ||
      ((await this.resolve({ address: addresses })) as AbstractWitness[]).map(
        (witness) => new WitnessWrapper({ account: this.account, module: witness }),
      )

    return this._witnesses
  }

  removeArchivist(address: string[]) {
    this.config.archivists = (this.config.archivists ?? []).filter((archivist) => !address.includes(archivist))
    this._archivists = undefined
  }

  removeWitness(address: string[]) {
    this.config.witnesses = (this.config.witnesses ?? []).filter((witness) => !address.includes(witness))
    this._witnesses = undefined
  }

  abstract report(payloads?: XyoPayload[]): Promise<XyoPayload[]>
}
