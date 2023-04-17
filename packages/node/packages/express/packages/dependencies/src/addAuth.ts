import { AdminApiKeyStrategy, AllowUnauthenticatedStrategy, JwtStrategy, LocalStrategy, Web3AuthStrategy } from '@xyo-network/express-node-middleware'
import { Container } from 'inversify'

export const addAuth = (container: Container) => {
  // container.bind(AdminApiKeyStrategy).to(AdminApiKeyStrategy).inSingletonScope()
  container.bind(AllowUnauthenticatedStrategy).toConstantValue(new AllowUnauthenticatedStrategy())
  // container.bind(JwtStrategy).to(JwtStrategy).inSingletonScope()
  // container.bind(LocalStrategy).to(LocalStrategy).inSingletonScope()
  // container.bind(Web3AuthStrategy).to(Web3AuthStrategy).inSingletonScope()
}
