const users = require('./router/users')
const track_parcel = require('./router/track_parcel')
const { router: authRouter, blacklist } = require('./router/auth')
const config = require('config')
const Express = require('express')
const verifyToken = require('./verify_token');
const { connectToMongoDB } = require('./db')
const startServer = async () => {
    await connectToMongoDB();
    const app = Express()
    app.use(Express.json())
    app.use('/api/users', users)
    app.use('/api/parcel', track_parcel)
    app.use('/api/auth', authRouter)
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`))

}
startServer();