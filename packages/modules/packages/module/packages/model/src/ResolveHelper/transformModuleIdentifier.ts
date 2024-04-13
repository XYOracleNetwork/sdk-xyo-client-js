import { ModuleIdentifier } from '../ModuleIdentifier'
import { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer'

export const transformModuleIdentifier = async (
  identifier: ModuleIdentifier,
  transformers: ModuleIdentifierTransformer[],
): Promise<ModuleIdentifier> => {
  let id = identifier
  for (const transformer of transformers) {
    id = await transformer.transform(id)
  }
  return id
}
