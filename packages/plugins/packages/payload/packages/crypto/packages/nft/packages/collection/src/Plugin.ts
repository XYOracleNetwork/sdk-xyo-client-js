import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { NftCollectionInfo } from './Payload'
import { NftCollectionSchema } from './Schema'
import { cryptoNftCollectionPayloadTemplate } from './Template'

export const NftCollectionInfoPayloadPlugin = () =>
  createPayloadPlugin<NftCollectionInfo>({
    schema: NftCollectionSchema,
    template: cryptoNftCollectionPayloadTemplate,
  })
