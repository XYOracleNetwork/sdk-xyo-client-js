import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistGetQuerySchema, ArchivistModule, ArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { AddressSpaceDiviner } from '@xyo-network/diviner-address-space-abstract'
import { AddressSpaceSchema } from '@xyo-network/diviner-address-space-model'
import { DivinerConfig, DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

export type MemoryAddressSpaceDivinerConfigSchema = `${AddressSpaceSchema}.memory.config`
export const MemoryAddressSpaceDivinerConfigSchema: MemoryAddressSpaceDivinerConfigSchema = `${AddressSpaceSchema}.memory.config`

export type MemoryAddressSpaceDivinerConfig = DivinerConfig<{
  address?: string
  archivists?: string[]
  schema: MemoryAddressSpaceDivinerConfigSchema
}>

export type MemoryAddressSpaceDivinerParams<
  TConfig extends AnyConfigSchema<MemoryAddressSpaceDivinerConfig> = AnyConfigSchema<MemoryAddressSpaceDivinerConfig>,
> = DivinerParams<TConfig>

/**
 * This Diviner returns the list of all addresses encountered for the reachable archivists
 */
export class MemoryAddressSpaceDiviner<TParams extends MemoryAddressSpaceDivinerParams>
  extends AbstractDiviner<TParams>
  implements AddressSpaceDiviner
{
  static override configSchema = MemoryAddressSpaceDivinerConfigSchema

  async divine(payloads?: Payload[]): Promise<Payload[]> {
    assertEx(!payloads?.length, 'MemoryAddressSpaceDiviner.divine does not allow payloads to be sent')
    const archivists = await this.archivists()
    assertEx(archivists.length > 0, 'Did not find any archivists')
    const bwLists = (
      await Promise.all(
        archivists.map(async (archivist) => {
          const all = await archivist.all?.()
          return (all?.filter((payload) => payload.schema === BoundWitnessSchema) as BoundWitness[]) ?? []
        }),
      )
    ).flat()
    const addresses = new Set<string>(
      bwLists
        .map((bw) => bw.addresses)
        .flat()
        .map((address) => address.toLowerCase()),
    )
    return [...addresses].map((address) => new PayloadBuilder({ schema: AddressSchema }).fields({ address }).build())
  }

  protected async archivists(): Promise<ArchivistModule[]> {
    if (this.config.archivists) {
      return await this.resolve<ArchivistModule>({ address: this.config.archivists })
    } else {
      //get all reachable archivists
      return (await this.resolve<ArchivistModule>({ query: [[ArchivistGetQuerySchema]] })).map((archivist) =>
        ArchivistWrapper.wrap(archivist, this.account),
      )
    }
  }
}
