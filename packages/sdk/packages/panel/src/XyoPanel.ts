import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { XyoArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessBuilder, XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule, XyoModuleConfig, XyoModuleResolverFunc } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessWrapper } from '@xyo-network/witness'
import compact from 'lodash/compact'

export type XyoPanelConfigSchema = 'network.xyo.panel.config'
export const XyoPanelConfigSchema: XyoPanelConfigSchema = 'network.xyo.panel.config'

export type XyoPanelConfig = XyoModuleConfig<{
  schema: XyoPanelConfigSchema
  archivists?: string[]
  witnesses: string[]
  onReportStart?: () => void
  onReportEnd?: (boundWitness?: XyoBoundWitness, errors?: Error[]) => void
  onWitnessReportStart?: (witness: XyoWitnessWrapper) => void
  onWitnessReportEnd?: (witness: XyoWitnessWrapper, error?: Error) => void
}>

export class XyoPanel extends XyoModule<XyoPanelConfig> {
  public history: XyoPayload[] = []

  constructor(config?: XyoPanelConfig, account?: XyoAccount, resolver?: XyoModuleResolverFunc) {
    super(config, account, resolver)
  }

  private _archivists: XyoArchivistWrapper[] | undefined
  public get archivists() {
    this._archivists =
      this._archivists ||
      compact(
        compact((Array.isArray(this.config?.archivists) ? this.config?.archivists : [this.config?.archivists]) ?? []).map((archivist) => {
          const module = this.resolver?.(archivist)
          if (module) {
            return new XyoArchivistWrapper(module)
          }
          throw Error(`Archivist not found: ${archivist}`)
        }),
      )
    return this._archivists
  }

  private _witnesses: XyoWitnessWrapper[] | undefined
  public get witnesses() {
    this._witnesses =
      this._witnesses ||
      compact(
        compact((Array.isArray(this.config?.witnesses) ? this.config?.witnesses : [this.config?.witnesses]) ?? []).map((witness) => {
          const module = this.resolver?.(witness)
          if (module) {
            return new XyoWitnessWrapper(module)
          }
          throw Error(`Witness not found: ${witness}`)
        }),
      )
    return this._witnesses
  }

  private async generatePayload(
    witness: XyoWitnessWrapper,
    onError?: (witness: XyoWitnessWrapper, error: Error) => void,
  ): Promise<[XyoPayloads | null, Error?]> {
    this.config?.onWitnessReportStart?.(witness)
    try {
      const result = await witness.observe()
      return [result]
    } catch (ex) {
      const error = ex as Error
      console.error(error)
      onError?.(witness, error)
      return [null, error]
    }
  }

  private async generatePayloads(witnesses: XyoWitnessWrapper[], onError?: (witness: XyoWitnessWrapper, error: Error) => void) {
    const payloads = await Promise.all(
      witnesses.map(async (witness) => {
        this.config?.onWitnessReportStart?.(witness)
        const [payload, error] = await this.generatePayload(witness, onError)
        this.config?.onWitnessReportEnd?.(witness, error)
        return payload
      }),
    )
    return payloads.flat()
  }

  public async report(adhocWitnesses: XyoWitness<XyoPayload>[] = []): Promise<[XyoBoundWitness[], XyoPayload[]]> {
    const errors: Error[] = []
    this.config?.onReportStart?.()
    const allWitnesses = [...adhocWitnesses.map((adhoc) => new XyoWitnessWrapper(adhoc)), ...this.witnesses]
    const payloads = compact(await this.generatePayloads(allWitnesses, (_, error) => errors.push(error)))
    const [newBoundWitness] = new BoundWitnessBuilder().payloads(payloads).witness(this.account).build()

    const bwList = (await Promise.all(this.archivists.map((archivist) => archivist.insert([newBoundWitness, ...payloads])))).flat()
    this.history.push(assertEx(bwList.at(-1)))
    this.config?.onReportEnd?.(newBoundWitness, errors.length > 0 ? errors : undefined)
    return [bwList, [newBoundWitness, ...payloads]]
  }
}
