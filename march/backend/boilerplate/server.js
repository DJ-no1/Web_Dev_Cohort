import "dotenv/config"
import app from "./src/app.js"
import connectDB from "./src/common/config/db.js"

const PORT = process.env.PORT || 5000

const startServer = async () => {
  

    //db se connect kare 

    await connectDB()
    //server start kare
    app.listen(PORT,() => {
        console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`)
    })}


    startServer().catch((err) => {
        console.log(`failed to start the server            ` ,err )
        process.exit(1)
    })