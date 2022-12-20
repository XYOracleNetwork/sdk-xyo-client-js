import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { QueryPayload } from './Payload'
import { QuerySchema } from './Schema'
import { queryPayloadTemplate } from './Template'

export const QueryPayloadPlugin = () =>
  createXyoPayloadPlugin<QueryPayload>({
    schema: QuerySchema,
    template: queryPayloadTemplate,
  })
