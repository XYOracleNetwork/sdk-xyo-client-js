import type { EventArgs } from '@xyo-network/module-events'

export type ModuleEventArgs<TModule extends object = object, TArgs extends EventArgs | undefined = undefined> =
  TArgs extends EventArgs ?
  {
    mod: TModule
  } & TArgs
    : {
        mod: TModule
      }
