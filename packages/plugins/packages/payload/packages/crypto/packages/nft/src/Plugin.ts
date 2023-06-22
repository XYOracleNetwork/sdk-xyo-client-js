import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { NftInfoPayload } from './Payload'
import { NftSchema } from './Schema'
import { cryptoWalletNftPayloadTemplate } from './Template'

export const NftInfoPayloadPlugin = () =>
  createPayloadPlugin<NftInfoPayload>({
    schema: NftSchema,
    template: cryptoWalletNftPayloadTemplate,
  })
