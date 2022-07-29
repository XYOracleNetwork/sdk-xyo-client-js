import { XyoSimpleWitness } from '../Witness'
import { XyoPluginPayload } from './Payload'
import { pluginTemplate } from './Template'

export class XyoNonFungibleTokenWitness extends XyoSimpleWitness<XyoPluginPayload> {
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
