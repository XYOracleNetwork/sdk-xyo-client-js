declare module 'node-screenlogic' {
  declare class EventEmitter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once<T>(event: string, func: (data: T) => void)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on<T>(event: string, func: (data: T) => void)

    eventNames(): string[]
  }

  declare class FindUnits extends EventEmitter {
    constructor()

    search()

    foundServer(msg, remote)

    sendServerBroadcast()

    close()
  }

  declare class RemoteLogin extends EventEmitter {
    constructor(systemName)

    connect()

    onConnected()

    onClientMessage(msg)

    close()
  }

  declare class UnitConnection extends EventEmitter {
    constructor(server, address?, password?)

    //this is an arbritrary field added in code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gatewayName: any

    close()

    connect()

    onConnected()

    login()

    processData(msg)

    getPoolStatus()

    getControllerConfig(senderId?)

    getChemicalData(senderId?)

    getSaltCellConfig(senderId?)

    getVersion(senderId?)

    getEquipmentConfiguration(senderId?)

    setCircuitState(controllerId, circuitId, circuitState, senderId?)

    setSetPoint(controllerId, bodyType, temperature, senderId?)

    setHeatMode(controllerId, bodyType, heatMode, senderId?)

    sendLightCommand(controllerId, command, senderId?)

    setSaltCellOutput(controllerId, poolOutput, spaOutput, senderId?)

    getScheduleData(scheduleType, senderId?)

    addNewScheduleEvent(scheduleType, senderId?)

    deleteScheduleEventById(scheduleId, senderId?)

    setScheduleEventById(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint, senderId?)

    setCircuitRuntimebyId(circuitId, runTime, senderId?)

    getPumpStatus(pumpId, senderId?)

    setPumpFlow(pumpId, circuitId, setPoint, isRPMs, senderId?)

    cancelDelay(senderId?)

    addClient(clientId, senderId?)

    removeClient(clientId, senderId?)

    getSystemTime(senderId?)

    setSystemTime(date, shouldAdjustForDST, senderId?)

    getHistoryData(fromTime, toTime, senderId?)

    getChemHistoryData(fromTime, toTime, senderId?)

    getWeatherForecast(senderId?)

    pingServer(senderId?)

    onClientMessage(msg)
  }

  declare const HEAT_MODE_DONTCHANGE
  declare const HEAT_MODE_HEATPUMP
  declare const HEAT_MODE_OFF
  declare const HEAT_MODE_SOLAR
  declare const HEAT_MODE_SOLARPREFERRED
  declare const LIGHT_CMD_COLOR_BLUE
  declare const LIGHT_CMD_COLOR_GREEN
  declare const LIGHT_CMD_COLOR_MODE_AMERICAN
  declare const LIGHT_CMD_COLOR_MODE_CARIBBEAN
  declare const LIGHT_CMD_COLOR_MODE_PARTY
  declare const LIGHT_CMD_COLOR_MODE_ROMANCE
  declare const LIGHT_CMD_COLOR_MODE_ROYAL
  declare const LIGHT_CMD_COLOR_MODE_SUNSET
  declare const LIGHT_CMD_COLOR_PURPLE
  declare const LIGHT_CMD_COLOR_RED
  declare const LIGHT_CMD_COLOR_SET
  declare const LIGHT_CMD_COLOR_SET_RECALL
  declare const LIGHT_CMD_COLOR_SET_SAVE
  declare const LIGHT_CMD_COLOR_SWIM
  declare const LIGHT_CMD_COLOR_SYNC
  declare const LIGHT_CMD_COLOR_WHITE
  declare const LIGHT_CMD_LIGHTS_OFF
  declare const LIGHT_CMD_LIGHTS_ON
  declare const PUMP_TYPE_INTELLIFLOVF
  declare const PUMP_TYPE_INTELLIFLOVS
  declare const PUMP_TYPE_INTELLIFLOVSF
}
