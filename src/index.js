import {SocketServer} from './socket-server'
import config from './config'

new SocketServer(config).start('PORT' in process.env ? parseInt(process.env.PORT) : 3000)
