const mongoose = require('mongoose');
const users = require("./routes/users")
const messages = require("./routes/messages")
const express = require('express');
const app = express()

mongoose.connect("mongodb://127.0.0.1/whatsapp-copy")
    .then(() => console.log(`connected to MongoDb`))
    .catch(err => console.log(err))


app.use(express.json())
app.use("/api/users", users)
app.use("/api/messages", messages)
    

app.get("/", (req, res) => {
    res.send("succes")
})


app.listen(3000, () => console.log("app listening on port 3000"))

