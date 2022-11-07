import {
  AdminApiKeyStrategy,
  AllowUnauthenticatedStrategy,
  ArchiveAccessControlStrategy,
  ArchiveAccountStrategy,
  ArchiveApiKeyStrategy,
  ArchiveOwnerStrategy,
  JwtStrategy,
  LocalStrategy,
  Web3AuthStrategy,
} from '@xyo-network/express-node-middleware'
import { Container } from 'inversify'

export const addAuth = (container: Container) => {
  container.bind(AdminApiKeyStrategy).to(AdminApiKeyStrategy).inSingletonScope()
  container.bind(AllowUnauthenticatedStrategy).toConstantValue(new AllowUnauthenticatedStrategy())
  container.bind(ArchiveAccessControlStrategy).toConstantValue(new ArchiveAccessControlStrategy())
  container.bind(ArchiveAccountStrategy).toConstantValue(new ArchiveAccountStrategy())
  container.bind(ArchiveApiKeyStrategy).to(ArchiveApiKeyStrategy).inSingletonScope()
  container.bind(ArchiveOwnerStrategy).toConstantValue(new ArchiveOwnerStrategy())
  container.bind(JwtStrategy).to(JwtStrategy).inSingletonScope()
  container.bind(LocalStrategy).to(LocalStrategy).inSingletonScope()
  container.bind(Web3AuthStrategy).to(Web3AuthStrategy).inSingletonScope()
}
