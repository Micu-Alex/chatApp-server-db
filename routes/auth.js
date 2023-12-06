const express = require('express');
const {User} = require("../models/user")
const Joi = require('joi');
const bcrypt = require("bcrypt")
const router = express.Router()

router.post("/", async (req, res) => {
    const {error} = validate(req.body)
    if (error) res.status(400).send(error.detaild[0].message)

    let user = await User.findOne({email: req.body.email})
    if (!user) return res.status(400).send("Invalid email or password")

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send("Invalid email or password")

    const token = user.generateAuthToken()

    res.send(token)
})

const validate = (req) => {
    const schema = Joi.object({
        email: Joi.string().min(5).max(50).required().email(),
        password: Joi.string().min(8).max(80).required()
    })
    return schema.validate(req)
}

module.exports = router