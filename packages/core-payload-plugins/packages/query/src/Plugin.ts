import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import type { QueryPayload } from './Payload.ts'
import { QuerySchema } from './Schema.ts'
import { queryPayloadTemplate } from './Template.ts'

export const QueryPayloadPlugin = () =>
  createPayloadPlugin<QueryPayload>({
    schema: QuerySchema,
    template: queryPayloadTemplate,
  })
