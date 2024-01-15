const {User, validate} = require("../models/user")
const express = require('express');
const bcrypt = require("bcryptjs")

const router = express.Router()

router.get("/", async (req, res) => {
    const users = await User.find().sort("name")
    if (!users) return res.status(404).send("the users was not fount")
    res.send(users)
})

router.post("/", async (req, res) => {
    const {error} = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({email: req.body.email})
    if (user) return res.status(400).send("Email already registered")

    user = new User({
        name: req.body.name.trim(),
        email: req.body.email.trim(),
        password: req.body.password.trim()
    })
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    await user.save()

    const token = user.generateAuthToken()
    res.send(token)
})


router.delete("/:id", async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) return res.status(404).send("the user was not found")

    res.send(user)
})


module.exports = router

