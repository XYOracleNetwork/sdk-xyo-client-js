import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { AddressSpaceDiviner } from '@xyo-network/diviner-address-space-abstract'
import { AddressSpaceDivinerConfigSchema, AddressSpaceDivinerParams } from '@xyo-network/diviner-address-space-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

/**
 * This Diviner returns the list of all addresses encountered for the reachable archivists
 */
export class MemoryAddressSpaceDiviner<TParams extends AddressSpaceDivinerParams = AddressSpaceDivinerParams>
  extends AbstractDiviner<TParams>
  implements AddressSpaceDiviner
{
  static override configSchemas = [AddressSpaceDivinerConfigSchema]

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    assertEx(!payloads?.length, 'MemoryAddressSpaceDiviner.divine does not allow payloads to be sent')
    const archivistMod = assertEx(await this.readArchivist(), 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod, this.account)
    const all = await archivist.all?.()
    const bwLists = (all?.filter((payload) => payload.schema === BoundWitnessSchema) as BoundWitness[]) ?? []
    const addresses = new Set<string>(
      bwLists
        .map((bw) => bw.addresses)
        .flat()
        .map((address) => address.toLowerCase()),
    )
    return [...addresses].map((address) => new PayloadBuilder({ schema: AddressSchema }).fields({ address }).build())
  }
}
