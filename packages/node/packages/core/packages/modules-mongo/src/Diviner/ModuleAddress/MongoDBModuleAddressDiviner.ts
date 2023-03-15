import { delay } from '@xylabs/delay'
import { AbstractDiviner, DivinerConfig, DivinerParams, XyoDivinerConfigSchema } from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module'
import {
  isModuleAddressQueryPayload,
  ModuleAddressDiviner,
  ModuleAddressPayload,
  ModuleAddressQueryPayload,
  ModuleAddressSchema,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayloads } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'

export type MongoDBModuleAddressDivinerParams = DivinerParams<AnyConfigSchema<DivinerConfig>>
export class MongoDBModuleAddressDiviner<TParams extends MongoDBModuleAddressDivinerParams = MongoDBModuleAddressDivinerParams>
  extends AbstractDiviner<TParams>
  implements ModuleAddressDiviner, JobProvider
{
  static override configSchema = XyoDivinerConfigSchema

  protected readonly boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
  protected readonly payloads: BaseMongoSdk<XyoPayloadWithMeta> = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)

  get jobs(): Job[] {
    return [
      // {
      //   name: 'MongoDBModuleAddressDiviner.DivineAddressesBatch',
      //   schedule: '10 minute',
      //   task: async () => await this.divineAddressesBatch(),
      // },
    ]
  }

  async divine(payloads?: XyoPayloads): Promise<XyoPayloads<ModuleAddressPayload>> {
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

  private divineAddressesBatch = async () => {
    this.logger?.log('MongoDBModuleAddressDiviner.DivineAddressesBatch: Divining addresses for batch')
    // TODO: Any background/batch processing here
    await Promise.resolve()
    this.logger?.log('MongoDBModuleAddressDiviner.DivineAddressesBatch: Divined addresses for batch')
  }
}
