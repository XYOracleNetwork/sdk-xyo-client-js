import { assertEx } from '@xylabs/assert'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistGetQuerySchema } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'

import { AbstractDiviner, DivinerParams } from '../AbstractDiviner'
import { AddressSpaceDiviner } from './AddressSpaceDiviner'

export type MemoryAddressSpaceDivinerConfigSchema = 'network.xyo.diviner.address.space.memory.config'
export const MemoryAddressSpaceDivinerConfigSchema = 'network.xyo.diviner.address.space.memory.config'

export type MemoryAddressSpaceDivinerConfig = DivinerConfig<
  XyoBoundWitness,
  {
    address: string
    schema: MemoryAddressSpaceDivinerConfigSchema
  }
>

/**
 * This Diviner returns the list of all addresses encountered for the reachable archivists
 */
export class MemoryAddressSpaceDiviner extends AbstractDiviner<DivinerParams<MemoryAddressSpaceDivinerConfig>> implements AddressSpaceDiviner {
  static override configSchema = MemoryAddressSpaceDivinerConfigSchema

  static override async create(params?: Partial<ModuleParams<MemoryAddressSpaceDivinerConfig>>): Promise<MemoryAddressSpaceDiviner> {
    return (await super.create(params)) as MemoryAddressSpaceDiviner
  }

  async divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    assertEx(!payloads?.length, 'MemoryAddressSpaceDiviner.divine does not allow payloads to be sent')
    const archivists = (await this.resolve({ query: [[ArchivistGetQuerySchema]] }))?.map((archivist) => new ArchivistWrapper(archivist)) ?? []
    assertEx(archivists.length > 0, 'Did not find any archivists')
    const bwLists = (
      await Promise.all(
        archivists.map(async (archivist) => {
          const all = await archivist.all()
          return all.filter((payload) => payload.schema === XyoBoundWitnessSchema) as XyoBoundWitness[]
        }),
      )
    ).flat()
    const addresses = new Set<string>(
      bwLists
        .map((bw) => bw.addresses)
        .flat()
        .map((address) => address.toLowerCase()),
    )
    return [...addresses].map((address) => new XyoPayloadBuilder({ schema: AddressSchema }).fields({ address }).build())
  }
}
