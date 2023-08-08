import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { NftInfo } from './Payload'
import { NftSchema } from './Schema'
import { cryptoWalletNftPayloadTemplate } from './Template'

export const NftInfoPayloadPlugin = () =>
  createPayloadPlugin<NftInfo>({
    schema: NftSchema,
    template: cryptoWalletNftPayloadTemplate,
  })
