import { XyoAddress } from '../Address'
import { XyoArchivistApi } from '../ArchivistApi'
import { XyoBoundWitnessBuilder } from '../BoundWitness'
import { XyoBoundWitness, XyoPayload } from '../models'
import { XyoWitness } from '../XyoWitness'

export interface XyoPanelConfig {
  address: XyoAddress
  archivists: XyoArchivistApi[]
  witnesses: XyoWitness<XyoPayload>[]
  previousHash?: string
  historyDepth?: number
  onReport?: (boundWitness: XyoBoundWitness) => void
  onHistoryRemove?: (removedBoundWitnesses: XyoBoundWitness[]) => void
  onHistoryAdd?: (addedBoundWitnesses: XyoBoundWitness[]) => void
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
    const newBoundWitness = new XyoBoundWitnessBuilder()
      .payloads(
        allWitnesses.map((witness) => {
          return witness.observe()
        })
      )
      .previousHash(this.config.previousHash)
      .build()
    this.config.previousHash = newBoundWitness._hash
    this.addToHistory(newBoundWitness)
    this.config.onReport?.(newBoundWitness)
    await Promise.allSettled(
      this.config.archivists.map((archivist) => {
        return archivist.postBoundWitness(newBoundWitness)
      })
    )
  }
}
