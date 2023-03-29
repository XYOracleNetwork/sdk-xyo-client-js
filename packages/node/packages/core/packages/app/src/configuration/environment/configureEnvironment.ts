import { ConfigurationFunction } from '../../model'
import { configureEnvironmentFromAWSSecret, configureEnvironmentFromDotEnv } from './providers'

export const configureEnvironment: ConfigurationFunction = async () => {
  await configureEnvironmentFromDotEnv()
  await configureEnvironmentFromAWSSecret()
}
