const mongoose = require('mongoose');
const users = require("./routes/users")
const express = require('express');
const app = express()

mongoose.connect("mongodb://127.0.0.1/whatsapp-copy")
    .then(() => console.log(`connected to MongoDb`))
    .catch(err => console.log(err))


app.use(express.json())
app.use("/api/users", users)
    

app.get("/", (req, res) => {
    res.send("succes")
})


app.listen(3000, () => console.log("app listening on port 3000"))

