const users = require("../routes/users")
const auth = require("../routes/auth")
const express = require('express');
const cors = require('cors');

const corsOptions = {
    origin: "http://localhost:5173"
  }
module.exports = (app) => {
    app.use(cors(corsOptions));
    app.use(express.json())
    app.use("/api/users", users)
    app.use("/api/auth", auth)}