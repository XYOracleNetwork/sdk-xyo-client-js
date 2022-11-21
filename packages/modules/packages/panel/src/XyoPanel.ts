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
  witnesses?: string[]
}>

export class XyoPanel extends XyoModule<XyoPanelConfig> {
  static override configSchema: XyoPanelConfigSchema

  public history: XyoPayload[] = []
  private _archivists: XyoArchivistWrapper[] | undefined
  private _witnesses: XyoWitnessWrapper[] | undefined

  static override async create(params?: Partial<XyoModuleParams<XyoPanelConfig>>): Promise<XyoPanel> {
    return (await super.create(params)) as XyoPanel
  }

  public async getArchivists() {
    const addresses = this.config?.archivists ? (Array.isArray(this.config.archivists) ? this.config?.archivists : [this.config.archivists]) : []
    this._archivists =
      this._archivists ||
      compact(
        compact(
          await Promise.all(
            addresses.map(async (address) => {
              const module = ((await this.resolver?.resolve({ address: [address] })) ?? []).shift()
              if (module) {
                return new XyoArchivistWrapper(module)
              }
              throw Error(`Archivist not found: ${address}`)
            }),
          ),
        ),
      )
    return this._archivists
  }

  public async getWitnesses() {
    const addresses = this.config?.witnesses ? (Array.isArray(this.config.witnesses) ? this.config?.witnesses : [this.config.witnesses]) : []
    this._witnesses =
      this._witnesses ||
      compact(
        compact(
          await Promise.all(
            addresses.map(async (address) => {
              const module = ((await this.resolver?.resolve({ address: [address] })) ?? []).shift()
              if (module) {
                return new XyoWitnessWrapper(module)
              }
              throw Error(`Witness not found: ${address}`)
            }),
          ),
        ),
      )
    return this._witnesses
  }

  public async report(adhocWitnesses: XyoWitness<XyoPayload>[] = []): Promise<[XyoBoundWitness[], XyoPayload[]]> {
    const errors: Error[] = []
    this.config?.onReportStart?.()
    const allWitnesses = [...adhocWitnesses.map((adhoc) => new XyoWitnessWrapper(adhoc)), ...(await this.getWitnesses())]
    const payloads = compact(await this.generatePayloads(allWitnesses))
    const [newBoundWitness] = new BoundWitnessBuilder().payloads(payloads).witness(this.account).build()

    const bwList = (await Promise.all((await this.getArchivists()).map((archivist) => archivist.insert([newBoundWitness, ...payloads])))).flat()
    this.history.push(assertEx(bwList.at(-1)))
    this.config?.onReportEnd?.(newBoundWitness, errors.length > 0 ? errors : undefined)
    return [bwList, [newBoundWitness, ...payloads]]
  }

  public async tryReport(adhocWitnesses: XyoWitness<XyoPayload>[] = []): Promise<[XyoBoundWitness[], XyoPayload[]]> {
    try {
      return await this.report(adhocWitnesses)
    } catch (ex) {
      const error = ex as Error
      this.logger?.warn(`report failed [${error.message}]`)
      return [[], []]
    }
  }

  private async generatePayloads(witnesses: XyoWitnessWrapper[]): Promise<XyoPayload[]> {
    return (await Promise.allSettled(witnesses?.map(async (witness) => await witness.observe())))
      .map((settled) => (settled.status === 'fulfilled' ? settled.value : []))
      .flat()
  }
}
