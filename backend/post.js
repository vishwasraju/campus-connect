const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
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

const Post = mongoose.model("Posts", postSchema);
const Comment = mongoose.model("Comment", commentSchema);

module.exports = {Post, Comment};