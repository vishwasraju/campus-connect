const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({

    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    postID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts",
        required: true
    }

}, {timestamps: true});

voteSchema.index({userID: 1, postID: 1}, {unique: true});

module.exports = mongoose.model("vote", voteSchema);