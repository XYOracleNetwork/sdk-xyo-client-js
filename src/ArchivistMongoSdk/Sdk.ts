import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { XyoBoundWitnessJson } from '../models'

class MongoSdk<T> extends BaseMongoSdk<XyoBoundWitnessJson<T>> {}

export default MongoSdk
