import {Server} from 'socket.io'

const io = new Server(process.env.PORT || 3001, {
    // options
})

io.on('connection', (socket) => {
    console.log('connected')
})

io.listen(3000)
