import { XyoNodeSystemInfoPayload } from './Payload'
import { XyoNodeSystemInfoPayloadSchema } from './Schema'

const defaultSystemInfoConfig = () => {
  return {
    audio: '*',
    battery: '*',
    bluetooth: '*',
    cpu: '*',
    diskLayout: '*',
    graphics: '*',
    mem: '*',
    networkInterfaces: '*',
    osInfo: '*',
    printer: '*',
    system: '*',
    usb: '*',
    wifiInterfaces: '*',
  }
}

const systemInfoNodeWitnessTemplate = (): XyoNodeSystemInfoPayload => ({
  schema: XyoNodeSystemInfoPayloadSchema,
})

export { defaultSystemInfoConfig, systemInfoNodeWitnessTemplate }
