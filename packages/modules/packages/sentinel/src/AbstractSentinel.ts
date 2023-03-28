import { AccountInstance } from '@xyo-network/account-model'
import { ArchivingModule } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { WitnessWrapper } from '@xyo-network/witness'
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

  history: BoundWitness[] = []
  private _archivists: ArchivistWrapper[] | undefined
  private _witnesses: WitnessWrapper[] | undefined

  override get queries(): string[] {
    return [SentinelReportQuerySchema, ...super.queries]
  }

  addArchivist(address: string[]) {
    this.config.archivists = uniq([...address, ...(this.config.archivists ?? [])])
    this._archivists = undefined
  }

  addWitness(address: string[]) {
    this.config.witnesses = uniq([...address, ...(this.config.witnesses ?? [])])
    this._witnesses = undefined
  }

  async getArchivists(account?: AccountInstance) {
    const addresses = this.config?.archivists ? (Array.isArray(this.config.archivists) ? this.config?.archivists : [this.config.archivists]) : []
    this._archivists =
      this._archivists ?? (await this.resolve({ address: addresses })).map((witness) => ArchivistWrapper.wrap(witness, account ?? this.account))
    if (addresses.length !== this._archivists.length) {
      this.logger?.warn(`Not all archivists found [Requested: ${addresses.length}, Found: ${this._archivists.length}]`)
    }

    return this._archivists
  }

  async getWitnesses(account?: AccountInstance) {
    const addresses = this.config?.witnesses ? (Array.isArray(this.config.witnesses) ? this.config?.witnesses : [this.config.witnesses]) : []
    this._witnesses =
      this._witnesses ?? (await this.resolve({ address: addresses })).map((witness) => WitnessWrapper.wrap(witness, account ?? this.account))

    if (addresses.length !== this._witnesses.length) {
      this.logger?.warn(`Not all witnesses found [Requested: ${addresses.length}, Found: ${this._witnesses.length}]`)
    }

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

  abstract report(payloads?: Payload[]): Promise<Payload[]>
}
