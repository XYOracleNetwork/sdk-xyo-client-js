import { delay } from '@xylabs/delay'
import { AbstractDiviner, DivinerConfig, DivinerParams, XyoDivinerConfigSchema } from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module'
import {
  isModuleAddressQueryPayload,
  ModuleAddressDiviner,
  ModuleAddressPayload,
  ModuleAddressQueryPayload,
  ModuleAddressSchema,
} from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayloads } from '@xyo-network/payload-model'

export type MongoDBModuleAddressDivinerParams = DivinerParams<AnyConfigSchema<DivinerConfig>>

export class MongoDBModuleAddressDiviner<TParams extends MongoDBModuleAddressDivinerParams = MongoDBModuleAddressDivinerParams>
  extends AbstractDiviner<TParams>
  implements ModuleAddressDiviner
{
  static override configSchema = XyoDivinerConfigSchema

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
}
