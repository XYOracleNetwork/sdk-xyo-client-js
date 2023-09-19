import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { Values } from './Payload'
import { ValuesSchema } from './Schema'
import { valuesPayloadTemplate } from './Template'

export const ValuesPayloadPlugin = () =>
  createPayloadPlugin<Values>({
    schema: ValuesSchema,
    template: valuesPayloadTemplate,
  })
