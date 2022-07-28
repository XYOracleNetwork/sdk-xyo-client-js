import { XyoSimpleWitness } from '../Witness'
import { XyoNonFungibleTokenMetaPayload } from './MetaPayload'
import { nonFungibleTokenMetaTemplate } from './Template'

export class XyoNonFungibleTokenMetaWitness extends XyoSimpleWitness<XyoNonFungibleTokenMetaPayload> {
  constructor() {
    const template = nonFungibleTokenMetaTemplate()
    super({
      schema: template.schema,
      template,
    })
  }

  override async observe() {
    return await super.observe({})
  }
}
