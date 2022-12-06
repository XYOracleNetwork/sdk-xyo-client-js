import { AbstractNode } from '@xyo-network/modules'

import { NodeConfigurationFunction } from '../model'

export const configureTransports: NodeConfigurationFunction = async (_node: AbstractNode) => {
  // Add Express, File, etc.
}
