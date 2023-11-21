import { assertEx } from '@xylabs/assert'
import { ModuleInstance } from '@xyo-network/module-model'

import { getBridge } from '../Bridge'

export const getModuleByName = async (name: string): Promise<ModuleInstance> => {
  const modules = await (await getBridge()).resolve({ name: [name] })
  expect(modules).toBeArrayOfSize(1)
  const mod = modules.pop()
  expect(mod).toBeTruthy()
  return assertEx(mod)
}
