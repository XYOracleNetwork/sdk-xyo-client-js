import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { QueryPayload } from './Payload.js'
import { QuerySchema } from './Schema.js'
import { queryPayloadTemplate } from './Template.js'

export const QueryPayloadPlugin = () =>
  createPayloadPlugin<QueryPayload>({
    schema: QuerySchema,
    template: queryPayloadTemplate,
  })
