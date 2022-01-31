import { XyoAddress } from '../Address'
import { XyoArchivistApi } from '../ArchivistApi'
import { XyoBoundWitnessBuilder } from '../BoundWitness'
import { XyoPayload } from '../models'
import { XyoWitness } from '../XyoWitness'

export interface XyoPanelConfig {
  address: XyoAddress
  archivists: XyoArchivistApi[]
  witnesses: XyoWitness<XyoPayload>[]
  previousHash?: string
}

export class XyoPanel {
  public config: XyoPanelConfig
  constructor(config: XyoPanelConfig) {
    this.config = config
  }

  public async report(adhocWitnesses: XyoWitness<XyoPayload>[] = []) {
    const allWitnesses: XyoWitness<XyoPayload>[] = Object.assign([], adhocWitnesses, this.config.witnesses)
    const bw = new XyoBoundWitnessBuilder()
      .payloads(
        allWitnesses.map((witness) => {
          return witness.observe()
        })
      )
      .previousHash(this.config.previousHash)
      .build()
    this.config.previousHash = bw._hash
    await Promise.allSettled(
      this.config.archivists.map((archivist) => {
        return archivist.postBoundWitness(bw)
      })
    )
  }
}
