import { config } from 'dotenv'

import { ConfigurationFunction } from '../../../model'

export const configureEnvironmentFromDotEnv: ConfigurationFunction = () => {
  config()
}
