import { XyoArchivistApi } from '../Api'
import { XyoAddress, XyoBoundWitness, XyoBoundWitnessBuilder, XyoPayload, XyoWitness } from '../core'

export interface XyoPanelConfig {
  address: XyoAddress
  archivists: XyoArchivistApi[]
  archive?: string
  witnesses: XyoWitness<XyoPayload>[]
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
  constructor(config: XyoPanelConfig) {
    this.config = config
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

  private async sendToArchivists(
    boundWitness: XyoBoundWitness,
    onError?: (archivist: XyoArchivistApi, error: Error) => void
  ) {
    const promises = this.config.archivists.map((archivist) => {
      const promiseResult = async () => {
        this.config.onArchivistSendStart?.(archivist)
        let error: Error | undefined = undefined
        let postResult: XyoBoundWitness[] | undefined = undefined
        try {
          postResult = await archivist.archives.archive().block.post([boundWitness])
          postResult?.forEach((value) => this.addToHistory(value))
        } catch (ex) {
          error = ex as Error
          onError?.(archivist, error)
          throw ex
        }
        this.config.onArchivistSendEnd?.(archivist, error)
        return postResult
      }
      return promiseResult()
    })
    return await Promise.allSettled(promises)
  }

  private async generatePayloads(witnesses: XyoWitness[], onError?: (witness: XyoWitness, error: Error) => void) {
    const payloads = await Promise.all(
      witnesses.map(async (witness) => {
        this.config.onWitnessReportStart?.(witness)
        const startTime = Date.now()
        let result: XyoPayload | undefined = undefined
        let error: Error | undefined = undefined
        try {
          result = await witness.observe()
        } catch (ex) {
          error = ex as Error
          onError?.(witness, error)
        }
        if (result) {
          result._observeDuration = Date.now() - startTime
        }
        this.config.onWitnessReportEnd?.(witness, error)
        return result ?? null
      })
    )
    return payloads
  }

  public async report(adhocWitnesses: XyoWitness<XyoPayload>[] = []) {
    const errors: Error[] = []
    this.config.onReportStart?.()
    const allWitnesses: XyoWitness<XyoPayload>[] = []
    allWitnesses.push(...adhocWitnesses)
    allWitnesses.push(...this.config.witnesses)
    const newBoundWitness = new XyoBoundWitnessBuilder({ inlinePayloads: this.config.inlinePayloads ?? true })
      .payloads(await this.generatePayloads(allWitnesses, (_, error) => errors.push(error)))
      .witness(this.config.address)
      .build()

    await this.sendToArchivists(newBoundWitness, (_, error) => errors.push(error))
    this.config.onReportEnd?.(newBoundWitness, errors.length > 0 ? errors : undefined)
    return newBoundWitness
  }
}
