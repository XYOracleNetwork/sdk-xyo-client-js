/* eslint-disable deprecation/deprecation */
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { Module } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

/** @deprecated use Sentinel version instead */
export interface Panel {
  report: (payloads?: XyoPayload[]) => Promisable<[XyoBoundWitness, XyoPayload[]]>
  tryReport: (payloads?: XyoPayload[]) => Promisable<[XyoBoundWitness | null, XyoPayload[]]>
}

/** @deprecated use Sentinel version instead */
export interface PanelModule extends Module, Panel {}
