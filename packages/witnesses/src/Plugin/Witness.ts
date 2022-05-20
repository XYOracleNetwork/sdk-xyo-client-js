import { XyoWitness } from '@xyo-network/core'

import { XyoPluginPayload } from './Payload'
import { pluginTemplate } from './Template'

export class XyoNonFungibleTokenWitness extends XyoWitness<XyoPluginPayload> {
  constructor() {
    const template = pluginTemplate()
    super({
      schema: template.schema,
      template,
    })
  }

  override async observe() {
    return await super.observe({})
  }
}
