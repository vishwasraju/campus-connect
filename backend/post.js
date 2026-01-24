const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({

    name: {
        type: String,
    },

    text: {
        type: String,
        required: true
    }

}, {timestamps: true});

const postSchema = new mongoose.Schema({

    category: {
        type: String,
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

    postVisibility: {
        type: String,
        enum: ['Public', 'Anonymous'],
        required:  true
    },

    name: {
        type: String,
        required: function(){
            return this.postVisibility === 'Public';
        }
    },

    studentID: {
        type: String,
        required: function(){
            return this.postVisibility === 'Public';
        }
    },

    upVotes: {
        type: Number,
        default: 0,
        min: 0
    },

    comments: [commentSchema]

}, {timestamps: true});

module.exports = mongoose.model("Posts", postSchema);