const {User} = require("../models/user")
const express = require('express');

const router = express.Router()


router.get("/", async (req, res) => {
    const users = await User.find().sort("name")
    if (!users) return res.status(404).send("the users was not fount")
    res.send(users)
})

module.exports = router