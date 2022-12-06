import { AbstractNode } from '@xyo-network/modules'
import { config } from 'dotenv'

import { NodeConfigurationFunction } from '../../../model'

export const configureEnvironmentFromDotEnv: NodeConfigurationFunction = (_node: AbstractNode) => {
  config()
}
