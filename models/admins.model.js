const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const adminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    password_salt: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default:""
    },
    profilePicURL: {
        type: String,
        default:""
    }
},{timestamps: true});

adminSchema.pre('findOneAndUpdate', function (next) {
    // Get the update object
    const update = this.getUpdate();

    // Increment the __v field
    if (update.$setOnInsert) {
        // For upsert operations, set __v to 0 if the document is being inserted
        update.$setOnInsert.__v = 0;
    } else {
        // Increment __v for update operations
        update.$inc = update.$inc || {};
        update.$inc.__v = 1;
    }

    next();
});
module.exports = mongoose.model("Admins", adminSchema);