import type { EventArgs } from '@xylabs/sdk-js'

export type ModuleEventArgs<TModule extends object = object, TArgs extends EventArgs | undefined = undefined>
  = TArgs extends EventArgs ? {
    mod: TModule
  } & TArgs
    : {
        mod: TModule
      }
