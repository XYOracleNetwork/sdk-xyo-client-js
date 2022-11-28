import { delay } from '@xylabs/delay'
import { AbstractDiviner, DivinerConfig } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'
import {
  ArchiveArchivist,
  isModuleAddressQueryPayload,
  ModuleAddressDiviner,
  ModuleAddressPayload,
  ModuleAddressQueryPayload,
  ModuleAddressSchema,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { XyoPayloadBuilder, XyoPayloads } from '@xyo-network/payload'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'

export class MongoDBModuleAddressDiviner extends AbstractDiviner implements ModuleAddressDiviner, JobProvider {
  protected archiveArchivist: ArchiveArchivist | undefined
  protected readonly boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
  protected readonly payloads: BaseMongoSdk<XyoPayloadWithMeta> = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)

  protected constructor(params: XyoModuleParams<DivinerConfig>) {
    super(params)
  }

  get jobs(): Job[] {
    return [
      {
        name: 'MongoDBModuleAddressDiviner.DivineAddressBatch',
        schedule: '10 minute',
        task: async () => await this.divineModuleAddressBatch(),
      },
    ]
  }

  static override async create(params?: Partial<XyoModuleParams<DivinerConfig>>): Promise<MongoDBModuleAddressDiviner> {
    return (await super.create(params)) as MongoDBModuleAddressDiviner
  }

  public async divine(payloads?: XyoPayloads): Promise<XyoPayloads<ModuleAddressPayload>> {
    const query = payloads?.find<ModuleAddressQueryPayload>(isModuleAddressQueryPayload)
    // If this is a query we support
    if (query) {
      // TODO: Extract relevant query values here
      this.logger?.log('MongoDBModuleAddressDiviner.Divine: Processing query')
      // Simulating work
      await delay(1)
      this.logger?.log('MongoDBModuleAddressDiviner.Divine: Processed query')
      return [new XyoPayloadBuilder<ModuleAddressPayload>({ schema: ModuleAddressSchema }).fields({}).build()]
    }
    // else return empty response
    return []
  }

  private divineModuleAddressBatch = async () => {
    this.logger?.log('MongoDBModuleAddressDiviner.DivineModuleAddressBatch: Divining addresses for batch')
    // TODO: Any background/batch processing here
    await Promise.resolve()
    this.logger?.log('MongoDBModuleAddressDiviner.DivineModuleAddressBatch: Divined addresses for batch')
  }
}
