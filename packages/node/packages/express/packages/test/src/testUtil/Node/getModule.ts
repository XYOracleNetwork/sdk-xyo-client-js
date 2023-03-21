import { assertEx } from '@xylabs/assert'
import { AccountInstance } from '@xyo-network/account-model'
import { Module, ModuleConstructable, ModuleWrapper } from '@xyo-network/modules'

import { unitTestSigningAccount } from '../Account'
import { getBridge } from '../Bridge'

export const getModuleByName = async (name: string): Promise<Module> => {
  const modules = await (await getBridge()).downResolver.resolve({ name: [name] })
  expect(modules).toBeArrayOfSize(1)
  const mod = modules.pop()
  expect(mod).toBeTruthy()
  return assertEx(mod)
}

export const getWrappedModuleByName = async <TModule extends Module = Module, TWrapper extends ModuleWrapper<TModule> = ModuleWrapper<TModule>>(
  name: string,
  wrapper: ModuleConstructable<TModule, TWrapper>,
  account: AccountInstance = unitTestSigningAccount,
): Promise<TWrapper> => {
  const module = await getModuleByName(name)
  return new wrapper({ account, module })
}
