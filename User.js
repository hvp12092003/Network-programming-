const mongoose = require("mongoose")

const schema = mongoose.Schema({
	username: String,
	password: String,
})

// name collection in MonGoDB
module.exports = mongoose.model("Data", schema)