import { AbstractNode } from '@xyo-network/modules'

// export type NodeRegistrationFunction<TConfig = any, TResp = void> = (node: AbstractNode, config?: TConfig) => Promise<TResp>
export type NodeRegistrationFunction<TResp = void> = (node: AbstractNode) => Promise<TResp>
