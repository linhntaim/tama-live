import {Exchange} from './exchange'
import {Spot} from '@binance/connector'

export class Binance extends Exchange
{
    constructor() {
        super()

        this.spot = new Spot()
        this.subscribed = null
        this.subscriptionHandlers = {}
        this.streams = {}
    }

    setSubscriptionHandler(subscriptionHandlers) {
        this.subscriptionHandlers = subscriptionHandlers
        return this
    }

    resetSubscription() {
        const streams = Object.keys(this.streams)
        this.subscribed && this.spot.unsubscribe(this.subscribed)
        this.subscribed = streams.length
            ? this.spot.combinedStreams(streams, this.subscriptionHandlers)
            : null
        return this
    }

    hasSubscription(stream) {
        return stream in this.streams
    }

    subscribe(stream) {
        if (this.hasSubscription(stream)) {
            ++this.streams[stream]
        }
        else {
            this.streams[stream] = 1
            this.resetSubscription()
        }
        return this
    }

    unsubscribe(stream) {
        if (this.hasSubscription(stream) && --this.streams[stream] <= 0) {
            delete this.streams[stream]
            this.resetSubscription()
        }
        return this
    }

    async price(symbol) {
        const usdPairs = ['USDT', 'BUSD']
        while (usdPairs.length) {
            try {
                const response = await this.spot.tickerPrice(symbol + usdPairs.shift())
                return response.data
            }
            catch (err) {
                if (!usdPairs.length) {
                    throw err
                }
            }
        }
    }
}
