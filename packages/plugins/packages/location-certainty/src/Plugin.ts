import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { LocationCertaintyDiviner, LocationCertaintyDivinerConfigSchema } from './Diviner'
import { LocationCertaintyPayload } from './Payload'
import { LocationCertaintySchema } from './Schema'
import { LocationCertaintyPayloadTemplate } from './Template'

export const LocationCertaintyPayloadPlugin = () =>
  createXyoPayloadPlugin<LocationCertaintyPayload>({
    auto: true,
    diviner: async (config): Promise<LocationCertaintyDiviner> => {
      const diviner = new LocationCertaintyDiviner({
        config: {
          ...config,
          schema: LocationCertaintyDivinerConfigSchema,
          targetSchema: LocationCertaintySchema,
        },
      })
      await diviner.start()
      return diviner
    },
    schema: LocationCertaintySchema,
    template: LocationCertaintyPayloadTemplate,
  })
