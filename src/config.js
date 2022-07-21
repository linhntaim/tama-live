import {Binance} from './binance'

export default {
    options: {},
    factories: {
        'binance': () => new Binance(),
    },
    before(server) {
        server.make('binance').setSubscriptionHandler({
            message: data => {
                const response = JSON.parse(data)
                server.emit(server.io.to(`ws.${response.stream}`), 'ws.subscribed', response)
            },
        })
    },
    streams: {
        '/': {
            _: function (server, namespace, socket) {
                //
            },
            subscribe: function (server, namespace, socket, stream) {
                socket.join(`ws.${stream}`)
                server.make('binance').subscribe(stream)
            },
            unsubscribe: function (server, namespace, socket, stream) {
                socket.leave(`ws.${stream}`)
                server.make('binance').unsubscribe(stream)
            },
            'symbol.price.fetch': function (server, namespace, socket, symbol) {
                server.make('binance').price(symbol)
                    .then(data => server.emit(socket, 'symbol.price.fetched', data))
            },
        },
    },
}
