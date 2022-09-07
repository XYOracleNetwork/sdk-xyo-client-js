import { XyoModule, XyoModuleQuerySchema } from '@xyo-network/module'

import { NodeModule } from './Node'

export abstract class XyoNode<TModule extends XyoModule = XyoModule> extends XyoModule implements NodeModule {
  public get queries(): XyoModuleQuerySchema[] {
    return []
  }

  register(_module: TModule): void {
    throw new Error('Method not implemented.')
  }

  abstract attach(_address: string): void
  abstract detatch(_address: string): void

  available(): string[] {
    throw new Error('Method not implemented.')
  }
  attached(): string[] {
    throw new Error('Method not implemented.')
  }
  abstract get(_address: string): TModule | undefined
}
