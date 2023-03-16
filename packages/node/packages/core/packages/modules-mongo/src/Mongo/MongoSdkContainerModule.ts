import { ContainerModule, interfaces } from 'inversify'

export const MongoSdkContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  // bind(MongoDBDeterministicArchivist).toDynamicValue(getMongoDBDeterministicArchivist).inSingletonScope()
  // bind<AbstractArchivist>(TYPES.Archivist).toDynamicValue(getMongoDBDeterministicArchivist).inSingletonScope()
  // bind<AbstractModule>(TYPES.Module).toDynamicValue(getMongoDBDeterministicArchivist).inSingletonScope()
})
