import {Server} from 'socket.io'

export class SocketServer
{
    constructor(config = {}) {
        this.io = new Server(config.options || {})
        this.io.on('connection', (socket) => {
            console.log(`Socket [${socket.id}] connected.`)
            this.emit(socket, 'connected', {msg: 'connected'})

            socket.on('disconnect', (reason) => {
                console.log(`Socket [${socket.id}] disconnected (${reason}).`)
            })
        })

        this.factories = config.factories || {}
        this.bindings = {}

        this.createStreams(config.streams || {})

        if (typeof config.before === 'function') {
            config.before(this)
        }
    }

    bind(name, factory) {
        this.factories[name] = factory
        return this
    }

    make(name) {
        return name in this.bindings
            ? this.bindings[name]
            : (name in this.factories ? this.bindings[name] = this.factories[name]() : null)
    }

    emit(emitter, event, data) {
        emitter.emit(event, {event, data})
    }

    createStream(stream, handlers = {}) {
        (namespace => {
            namespace.on('connection', (socket) => {
                console.log(`Stream [${stream}]: Socket [${socket.id}] connected.`)
                this.emit(socket, 'stream.connected', {msg: `Stream [${stream}]: Connected.`})

                if ('_' in handlers) {
                    handlers._(this, namespace, socket)
                    delete handlers._
                }
                Object.keys(handlers).forEach(event => socket.on(event, (...args) => handlers[event](this, namespace, socket, ...args)))

                socket.on('disconnect', (reason) => {
                    console.log(`Stream [${stream}]: Socket [${socket.id}] disconnected (${reason}).`)
                })
            })
        })(this.io.of(stream))
        return this
    }

    createStreams(streams) {
        Object.keys(streams).forEach(stream => this.createStream(stream, streams[stream]))
        return this
    }

    start(port = 3000) {
        this.io.listen(port)
    }
}
