import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { ValuesPayload } from './Payload'
import { ValuesSchema } from './Schema'
import { valuesPayloadTemplate } from './Template'

export const ValuesPayloadPlugin = () =>
  createPayloadPlugin<ValuesPayload>({
    schema: ValuesSchema,
    template: valuesPayloadTemplate,
  })
