const users = require("../routes/users")
const auth = require("../routes/auth")
const express = require('express');
const corsMiddleware = require("../middleware/cores");



module.exports = (app) => {
    app.use(corsMiddleware);
    app.use(express.json())
    app.use("/api/users", users)
    app.use("/api/auth", auth)}