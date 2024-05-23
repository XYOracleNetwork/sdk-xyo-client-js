import { ModuleIdentifier } from '../ModuleIdentifier'
import { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer'

export const transformModuleIdentifier = async (
  id: ModuleIdentifier,
  transformers: ModuleIdentifierTransformer[],
): Promise<ModuleIdentifier | undefined> => {
  let result: ModuleIdentifier | undefined = id
  for (const transformer of transformers) {
    result = await transformer.transform(id)
  }
  return result
}
