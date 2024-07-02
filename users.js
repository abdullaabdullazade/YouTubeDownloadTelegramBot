const mongoose = require('mongoose')


const users = mongoose.Schema(
    {
        id: Number
    }
)


module.exports = mongoose.model("Users",users)