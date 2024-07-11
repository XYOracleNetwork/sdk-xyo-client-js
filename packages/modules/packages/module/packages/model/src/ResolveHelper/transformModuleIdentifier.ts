import { ModuleIdentifier } from '../ModuleIdentifier.js'
import { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer.js'

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
