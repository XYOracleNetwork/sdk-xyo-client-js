import { XyoLegacyWitness } from '@xyo-network/core'

import { XyoNonFungibleTokenPayload } from './Payload'
import { nonFungibleTokenTemplate } from './Template'

export class XyoNonFungibleTokenWitness extends XyoLegacyWitness<XyoNonFungibleTokenPayload> {
  constructor() {
    const template = nonFungibleTokenTemplate()
    super({
      schema: template.schema,
      template,
    })
  }

  override async observe() {
    return await super.observe({})
  }
}
