import {
  DebugQueryHandler,
  GetArchivePermissionsQueryHandler,
  GetDomainConfigQueryHandler,
  GetSchemaQueryHandler,
  SetArchivePermissionsQueryHandler,
} from '@xyo-network/node-core-query-handlers'
import { Container } from 'inversify'

export const addPayloadHandlers = (container: Container) => {
  container.bind(DebugQueryHandler).to(DebugQueryHandler).inTransientScope()
  container.bind(SetArchivePermissionsQueryHandler).to(SetArchivePermissionsQueryHandler).inTransientScope()
  container.bind(GetArchivePermissionsQueryHandler).to(GetArchivePermissionsQueryHandler).inTransientScope()
  container.bind(GetDomainConfigQueryHandler).to(GetDomainConfigQueryHandler).inTransientScope()
  container.bind(GetSchemaQueryHandler).to(GetSchemaQueryHandler).inTransientScope()
}
