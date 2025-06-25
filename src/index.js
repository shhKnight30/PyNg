import dotenv from 'dotenv'

import { app } from './app.js'
import connectDB from './config/db/index.js'

dotenv.config({
    path:"../.env"
})

connectDB()
.then(()=>{
    const port = process.env.PORT || 8000
    app.listen(port , ()=>{
        console.log('Server is running on PORT :' + port)
    })
})
.catch((error)=>{
    console.log("MONGODB connection FAILED", error)
})