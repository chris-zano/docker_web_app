const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const codeSchema = new Schema({
    recipient_email: {
        type: String,
        required: true,
        unique:false,
    },
    code: {
        type: String,
        required: true
    },
    tempId: {
        type: String,
        required: true
    }
},{timestamps: true});

module.exports = mongoose.model("Codes", codeSchema);