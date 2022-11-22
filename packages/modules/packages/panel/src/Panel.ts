import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { Module } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

export interface Panel {
  report: (payloads?: XyoPayload[]) => Promisable<[XyoBoundWitness[], XyoPayload[]]>
  tryReport: (payloads?: XyoPayload[]) => Promisable<[XyoBoundWitness[], XyoPayload[]]>
}

export interface PanelModule extends Module, Panel {}
