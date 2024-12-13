const mongoose = require("mongoose");
const { emailRegexp } = require("../utils/mailer.utils");
const Schema = mongoose.Schema;
const emailRegex = emailRegexp()

const fileSchema = new Schema({
    admin_id: {
        type: mongoose.Types.ObjectId,
        ref: "Admins",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    originalname: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    encoding: {
        type: String,
        required: true
    },
    file_size: {
        type: String,
        required: true
    },
    filePathUrl: {
        type: String,
        required: true
    },
    downloads: [{ type: mongoose.Types.ObjectId, ref: "Customers" }],
    shared: [{
        from: { type: mongoose.Types.ObjectId, ref: "Customers" },
        recipients: [{
            type: "String",
            validate: {
                validator: function (v) {
                    return emailRegex.test(v)
                }
            }
        }],
        status: {
            type: String,
            enum: ["pending", "failed", "success"]
        },
        log: {type: String}
    }],
    visibility: String,
    type: {
        type: String,
        enum: ['Image File', 'PDF Document', 'Word Document'],
        required: true
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

fileSchema.virtual('admin_details', {
    ref: 'Admins',
    localField: 'admin_id',
    foreignField: '_id',
    justOne: true
});


fileSchema.pre('find', function () {
    this.populate('admin_details', '_id username email')
});

fileSchema.pre('findOne', function () {
    this.populate('admin_details', '_id username email')
});

fileSchema.pre('findOneAndUpdate', function (next) {
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
const FileModel = mongoose.model("File", fileSchema);
module.exports = FileModel;