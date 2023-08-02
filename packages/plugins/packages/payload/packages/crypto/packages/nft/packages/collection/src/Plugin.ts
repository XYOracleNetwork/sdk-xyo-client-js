import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { NftCollectionInfoPayload } from './Payload'
import { NftCollectionSchema } from './Schema'
import { cryptoNftCollectionPayloadTemplate } from './Template'

export const NftCollectionInfoPayloadPlugin = () =>
  createPayloadPlugin<NftCollectionInfoPayload>({
    schema: NftCollectionSchema,
    template: cryptoNftCollectionPayloadTemplate,
  })
