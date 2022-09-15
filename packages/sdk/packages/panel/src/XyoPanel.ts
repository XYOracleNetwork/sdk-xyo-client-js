import { XyoAccount } from '@xyo-network/account'
import { PayloadArchivist, XyoArchivistWrapper } from '@xyo-network/archivist'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPartialPayloadMeta, XyoPayload } from '@xyo-network/payload'
import { XyoWitness } from '@xyo-network/witness'
import compact from 'lodash/compact'

export interface XyoPanelConfig {
  archive?: string
  witnesses: XyoWitness[]
  onReportStart?: () => void
  onReportEnd?: (boundWitness?: XyoBoundWitness, errors?: Error[]) => void
  onWitnessReportStart?: (witness: XyoWitness) => void
  onWitnessReportEnd?: (witness: XyoWitness, error?: Error) => void
}

export class XyoPanel {
  public config: XyoPanelConfig
  public history: XyoBoundWitness[] = []
  public archivist: XyoArchivistWrapper
  public account: XyoAccount
  constructor({ witnesses, ...config }: Partial<XyoPanelConfig>, archivist: PayloadArchivist) {
    this.config = {
      ...config,
      witnesses: witnesses ?? [],
    }
    this.archivist = new XyoArchivistWrapper(archivist)
    this.account = new XyoAccount()
  }

  private async generatePayload(
    witness: XyoWitness,
    onError?: (witness: XyoWitness, error: Error) => void,
  ): Promise<[XyoPartialPayloadMeta<XyoPayload> | null, Error?]> {
    this.config.onWitnessReportStart?.(witness)
    const startTime = Date.now()
    try {
      const result: XyoPartialPayloadMeta<XyoPayload> = await witness.observe()
      if (result) {
        result._observeDuration = Date.now() - startTime
      }
      return [result]
    } catch (ex) {
      const error = ex as Error
      console.error(error)
      onError?.(witness, error)
      return [null, error]
    }
  }

  private async generatePayloads(witnesses: XyoWitness[], onError?: (witness: XyoWitness, error: Error) => void) {
    const payloads = await Promise.all(
      witnesses.map(async (witness) => {
        this.config.onWitnessReportStart?.(witness)
        const [payload, error] = await this.generatePayload(witness, onError)
        this.config.onWitnessReportEnd?.(witness, error)
        return payload
      }),
    )
    return payloads
  }

  public async report(adhocWitnesses: XyoWitness<XyoPayload>[] = []) {
    const errors: Error[] = []
    this.config.onReportStart?.()
    const allWitnesses: XyoWitness<XyoPayload>[] = [...adhocWitnesses, ...this.config.witnesses]
    const payloads = compact(await this.generatePayloads(allWitnesses, (_, error) => errors.push(error)))
    const newBoundWitness = new XyoBoundWitnessBuilder().payloads(payloads).witness(this.account).build()

    const bw = await this.archivist.insert([newBoundWitness, ...payloads])
    this.config.onReportEnd?.(newBoundWitness, errors.length > 0 ? errors : undefined)
    return bw
  }
}
