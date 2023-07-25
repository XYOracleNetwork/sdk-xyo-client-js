import { EventArgs } from '@xyo-network/module-events'

export type ModuleEventArgs<TModule, TArgs extends EventArgs | undefined = undefined> = TArgs extends EventArgs
  ? {
      module: TModule
    } & TArgs
  : {
      module: TModule
    }
