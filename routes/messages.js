const {Message} = require("../models/message")
const express = require('express');
const auth = require("../middleware/auth")

const router = express.Router()

router.post("/", auth, async (req, res) => {

    const message = new Message({message: req.body.message})

    await message.save()

    res.send(message)
})

module.exports = router