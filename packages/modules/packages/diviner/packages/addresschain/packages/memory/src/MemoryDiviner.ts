import { assertEx } from '@xylabs/assert'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { DirectArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AddressChainDiviner } from '@xyo-network/diviner-address-chain-abstract'
import { AddressChainDivinerConfig, AddressChainDivinerConfigSchema } from '@xyo-network/diviner-address-chain-model'
import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

// This diviner returns the most recent boundwitness signed by the address that can be found
// if multiple broken chains are found, all the heads are returned
export type MemoryAddressChainDivinerParams = DivinerParams<AnyConfigSchema<AddressChainDivinerConfig>>

export class MemoryAddressChainDiviner<
  TParams extends MemoryAddressChainDivinerParams = MemoryAddressChainDivinerParams,
> extends AddressChainDiviner<TParams> {
  static override configSchemas = [AddressChainDivinerConfigSchema]

  get queryAddress() {
    return assertEx(this.config.address, 'Missing address')
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const result: Payload[] = []
    assertEx(!payloads?.length, 'MemoryAddressChainDiviner.divine does not allow payloads to be sent')
    try {
      const archivistIn = await this.readArchivist()
      const archivist = assertEx(archivistIn, 'Unable to resolve archivist')
      let currentHash: string | null = assertEx(this.config.startHash, 'Missing startHash')
      while (currentHash && result.length < (this.config.maxResults ?? 1000)) {
        const bwPayload: BoundWitness | undefined = await this.archivistFindHash([archivist], currentHash)
        const bwWrapper: BoundWitnessWrapper | undefined = BoundWitnessWrapper.tryParse(bwPayload)
        if (bwWrapper) {
          result.push(bwWrapper.payload())
          currentHash = bwWrapper.prev(this.queryAddress)
        }
      }
    } catch (ex) {
      console.log(ex)
    }
    return result
  }

  private async archivistFindHash(archivists: ArchivistInstance[], hash: string): Promise<BoundWitness | undefined> {
    let index = 0
    if (archivists[index]) {
      const result = (await archivists[index].get([hash])).pop() as BoundWitness
      if (result) {
        return result
      }
      index++
    }
  }
}
