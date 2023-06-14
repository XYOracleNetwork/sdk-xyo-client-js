import { NodeSystemInfoPayload } from './Payload'
import { NodeSystemInfoSchema } from './Schema'

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

const systemInfoNodeWitnessTemplate = (): NodeSystemInfoPayload => ({
  schema: NodeSystemInfoSchema,
})

export { defaultSystemInfoConfig, systemInfoNodeWitnessTemplate }
