require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

const userRoutes = require("./routes/user")
const groupRoutes = require('./routes/group')

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send("Welcome to the group app")
})

app.use('/api/users', userRoutes)
app.use('/api/group', groupRoutes)

const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})