import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { LocationCertaintyDiviner, LocationCertaintyDivinerConfig, LocationCertaintyDivinerConfigSchema } from './Diviner'
import { LocationCertaintyPayload } from './Payload'
import { LocationCertaintySchema } from './Schema'
import { LocationCertaintyPayloadTemplate } from './Template'

export const LocationCertaintyPayloadPlugin = () =>
  createXyoPayloadPlugin<LocationCertaintyPayload>({
    auto: true,
    diviner: async (config): Promise<LocationCertaintyDiviner> => {
      return await LocationCertaintyDiviner.create({
        config: {
          ...config,
          schema: LocationCertaintyDivinerConfigSchema,
          targetSchema: LocationCertaintySchema,
        } as LocationCertaintyDivinerConfig,
      })
    },
    schema: LocationCertaintySchema,
    template: LocationCertaintyPayloadTemplate,
  })
