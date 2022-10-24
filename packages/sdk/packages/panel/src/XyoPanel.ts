import { assertEx } from '@xylabs/assert'
import { XyoArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessBuilder, XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule, XyoModuleConfig, XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessWrapper } from '@xyo-network/witness'
import compact from 'lodash/compact'

export type XyoPanelConfigSchema = 'network.xyo.panel.config'
export const XyoPanelConfigSchema: XyoPanelConfigSchema = 'network.xyo.panel.config'

export type XyoPanelConfig = XyoModuleConfig<{
  archivists?: string[]
  onReportEnd?: (boundWitness?: XyoBoundWitness, errors?: Error[]) => void
  onReportStart?: () => void
  onWitnessReportEnd?: (witness: XyoWitnessWrapper, error?: Error) => void
  onWitnessReportStart?: (witness: XyoWitnessWrapper) => void
  schema: XyoPanelConfigSchema
  witnesses: string[]
}>

export class XyoPanel extends XyoModule<XyoPanelConfig> {
  public history: XyoPayload[] = []
  private _archivists: XyoArchivistWrapper[] | undefined
  private _witnesses: XyoWitnessWrapper[] | undefined

  public get archivists() {
    this._archivists =
      this._archivists ||
      compact(
        compact((Array.isArray(this.config?.archivists) ? this.config?.archivists : [this.config?.archivists]) ?? []).map((archivist) => {
          const module = this.resolver?.fromAddress([archivist]).shift()
          if (module) {
            return new XyoArchivistWrapper(module)
          }
          throw Error(`Archivist not found: ${archivist}`)
        }),
      )
    return this._archivists
  }

  public get witnesses() {
    this._witnesses =
      this._witnesses ||
      compact(
        compact((Array.isArray(this.config?.witnesses) ? this.config?.witnesses : [this.config?.witnesses]) ?? []).map((witness) => {
          const module = this.resolver?.fromAddress([witness]).shift()
          if (module) {
            return new XyoWitnessWrapper(module)
          }
          throw Error(`Witness not found: ${witness}`)
        }),
      )
    return this._witnesses
  }

  static override async create(params?: XyoModuleParams<XyoPanelConfig>): Promise<XyoPanel> {
    params?.logger?.debug(`params: ${JSON.stringify(params, null, 2)}`)
    const module = new XyoPanel(params)
    await module.start()
    return module
  }

  public async report(adhocWitnesses: XyoWitness<XyoPayload>[] = []): Promise<[XyoBoundWitness[], XyoPayload[]]> {
    const errors: Error[] = []
    this.config?.onReportStart?.()
    const allWitnesses = [...adhocWitnesses.map((adhoc) => new XyoWitnessWrapper(adhoc)), ...this.witnesses]
    const payloads = compact(await this.generatePayloads(allWitnesses))
    const [newBoundWitness] = new BoundWitnessBuilder().payloads(payloads).witness(this.account).build()

    const bwList = (await Promise.all(this.archivists.map((archivist) => archivist.insert([newBoundWitness, ...payloads])))).flat()
    this.history.push(assertEx(bwList.at(-1)))
    this.config?.onReportEnd?.(newBoundWitness, errors.length > 0 ? errors : undefined)
    return [bwList, [newBoundWitness, ...payloads]]
  }

  private async generatePayloads(witnesses: XyoWitnessWrapper[]): Promise<XyoPayload[]> {
    return (await Promise.allSettled(witnesses?.map(async (witness) => await witness.observe())))
      .map((settled) => (settled.status === 'fulfilled' ? settled.value : []))
      .flat()
  }
}
