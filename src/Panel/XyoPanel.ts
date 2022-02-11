import { XyoAddress } from '../Address'
import { XyoArchivistApi } from '../ArchivistApi'
import { XyoBoundWitnessBuilder } from '../BoundWitness'
import { XyoBoundWitness, XyoPayload } from '../models'
import { XyoWitness } from '../XyoWitness'

export interface XyoPanelConfig {
  address: XyoAddress
  archivists: XyoArchivistApi[]
  witnesses: XyoWitness<XyoPayload>[]
  historyDepth?: number
  onReport?: (boundWitness: XyoBoundWitness) => void
  onHistoryRemove?: (removedBoundWitnesses: XyoBoundWitness[]) => void
  onHistoryAdd?: (addedBoundWitnesses: XyoBoundWitness[]) => void
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

  public async report(adhocWitnesses: XyoWitness<XyoPayload>[] = []) {
    const allWitnesses: XyoWitness<XyoPayload>[] = Object.assign([], adhocWitnesses, this.config.witnesses)
    const newBoundWitness = new XyoBoundWitnessBuilder({ inlinePayloads: this.config.inlinePayloads })
      .payloads(
        allWitnesses.map((witness) => {
          return witness.observe()
        })
      )
      .witness(this.config.address)
      .build()
    await Promise.allSettled(
      this.config.archivists.map((archivist) => {
        const boundWitnessWithArchive = { ...newBoundWitness, _archive: archivist.archive }
        this.addToHistory(boundWitnessWithArchive)
        this.config.onReport?.(boundWitnessWithArchive)
        return archivist.postBoundWitness(newBoundWitness)
      })
    )
    return newBoundWitness
  }
}
