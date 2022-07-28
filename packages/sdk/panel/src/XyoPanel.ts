import { assertEx } from '@xylabs/sdk-js'
import { XyoAccount } from '@xyo-network/account'
import { XyoArchivistApi } from '@xyo-network/api'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPartialPayloadMeta, XyoPayload } from '@xyo-network/payload'
import { XyoWitness } from '@xyo-network/witnesses'

export interface XyoPanelConfig {
  /** @deprecated use account instead */
  address?: XyoAccount
  /** @deprecated use account instead */
  wallet?: XyoAccount
  account: XyoAccount
  archivists: XyoArchivistApi[]
  archive?: string
  witnesses: XyoWitness[]
  historyDepth?: number
  onReportStart?: () => void
  onReportEnd?: (boundWitness?: XyoBoundWitness, errors?: Error[]) => void
  onHistoryRemove?: (removedBoundWitnesses: XyoBoundWitness[]) => void
  onHistoryAdd?: (addedBoundWitnesses: XyoBoundWitness[]) => void
  onArchivistSendStart?: (archivist: XyoArchivistApi) => void
  onArchivistSendEnd?: (archivist: XyoArchivistApi, error?: Error) => void
  onWitnessReportStart?: (witness: XyoWitness) => void
  onWitnessReportEnd?: (witness: XyoWitness, error?: Error) => void
  inlinePayloads?: boolean
}

export class XyoPanel {
  public config: XyoPanelConfig
  public history: XyoBoundWitness[] = []
  constructor({ archivists, witnesses, ...config }: Partial<XyoPanelConfig>) {
    this.config = {
      ...config,
      // eslint-disable-next-line deprecation/deprecation
      account: assertEx(config.account ?? config.wallet ?? config.address, 'account is required'),

      archivists: archivists ?? [],
      witnesses: witnesses ?? [],
    }
  }

  public get historyDepth() {
    return this.config.historyDepth ?? 100
  }

  private addToHistory(boundWitness: XyoBoundWitness) {
    const removedBoundWitnesses: XyoBoundWitness[] = []
    while (this.history.length >= this.historyDepth) {
      const removedBoundWitness = this.history.shift()
      if (removedBoundWitness) {
        removedBoundWitnesses.push(removedBoundWitness)
      }
    }
    if (removedBoundWitnesses.length > 0) {
      this.config.onHistoryRemove?.(removedBoundWitnesses)
    }
    this.history.push(boundWitness)
    this.config.onHistoryAdd?.([boundWitness])
  }

  private async sendToArchivists(boundWitness: XyoBoundWitness, onError?: (archivist: XyoArchivistApi, error: Error) => void) {
    const promises = this.config.archivists.map((archivist) => {
      const promiseResult = async () => {
        this.config.onArchivistSendStart?.(archivist)
        let error: Error | undefined = undefined
        let postResult: XyoBoundWitness[] | undefined = undefined
        try {
          postResult = await archivist.archives.archive(this.config.archive).block.post([boundWitness])
          postResult?.forEach((value) => this.addToHistory(value))
        } catch (ex) {
          error = ex as Error
          onError?.(archivist, error)
          expect(error === undefined)
        }
        this.config.onArchivistSendEnd?.(archivist, error)
        return postResult
      }
      return promiseResult()
    })
    return await Promise.allSettled(promises)
  }

  private async generatePayload(witness: XyoWitness, onError?: (witness: XyoWitness, error: Error) => void): Promise<[XyoPartialPayloadMeta<XyoPayload> | null, Error?]> {
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
      })
    )
    return payloads
  }

  public async report(adhocWitnesses: XyoWitness<XyoPayload>[] = []) {
    const errors: Error[] = []
    this.config.onReportStart?.()
    const allWitnesses: XyoWitness<XyoPayload>[] = [...adhocWitnesses, ...this.config.witnesses]
    const newBoundWitness = new XyoBoundWitnessBuilder({ inlinePayloads: this.config.inlinePayloads ?? true })
      .payloads(await this.generatePayloads(allWitnesses, (_, error) => errors.push(error)))
      .witness(this.config.account)
      .build()

    await this.sendToArchivists(newBoundWitness, (_, error) => errors.push(error))
    this.config.onReportEnd?.(newBoundWitness, errors.length > 0 ? errors : undefined)
    return newBoundWitness
  }
}
