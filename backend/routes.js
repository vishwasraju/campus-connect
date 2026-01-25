const express = require('express');
const {z} = require('zod');
const {authMiddleWare, adminMiddleWare} = require('./auth.middleware');
const {Post, Comment} = require('./post');
const Vote = require('./voteSchema');
const mongoose = require('mongoose');

// Zod schemas
const postSchema = z.object({
    category: z.string(),
    title: z.string(),
    description: z.string(),
    postVisibility: z.string(),
    name: z.string().optional(),
    studentID: z.string().length(10).optional()
});

const commentZodSchema = z.object({
    postID: z.string(),
    comment: z.string(),
    name: z.string()
})

const router = express.Router();

router.post("/post", authMiddleWare, async (req, res) => {

    try{

        console.log(req.body);
        const {success, data} = postSchema.safeParse(req.body);

    if(!success){
        return res.status(412).json({message: "Invalid format"});
    }

    const post = new Post({
        category: data.category,
        title: data.title,
        description: data.description,
        postVisibility: data.postVisibility,
        name: data.name,
        studentID: data.studentID
    });

    await post.save();
    return res.status(201).json({message: "Posted Successfully"});

    } catch(err){
        console.error(err);
        return res.status(500).json({ message: err.message || "Internal Server Error" });
    }

});

router.get("/posts", authMiddleWare, async (req, res) => {

    try{

        const fetchPosts = await Post.find().select('studentID name category createdAt description title postVisibility upVotes comments');

        const postIds = fetchPosts.map(post => post._id);
        const userVotes = await Vote.find({
            userID: req.user,
            postID: {$in: postIds}
        }).select('postID');
        const votedPostIds = new Set(userVotes.map(vote => vote.postID.toString()));
        const postsWithUpvoteStatus = fetchPosts.map(post => ({
            ...post.toObject(),
            hasUpvoted: votedPostIds.has(post._id.toString()),
            commentsCount: post.comments.length,
            createdAt: post.createdAt.toString(),

        }));


        res.status(201).json(postsWithUpvoteStatus);

    } catch(err){
        return res.status(500).json({message: err.message || "Internal Server Error"});
    }

});

router.post("/post/:postId/vote", authMiddleWare, async (req, res) => {

    const userId = req.user;
    const postId = req.params.postId;


    try{

        await Vote.create({
            userID: userId,
            postID: postId
        });

        await Post.findByIdAndUpdate(
            postId,
            {$inc: {upVotes: 1}},
            {new: true}
        );

        return res.status(201).json({message: "Voted successfully"});

    } catch(err){

        if(err.code === 11000){

            await Vote.deleteOne({
                userID: userId,
                postID: postId
            });

            await Post.findByIdAndUpdate(
                postId,
                {$inc: {upVotes: -1}},
                {new: true}
            )

            return res.status(200).json({message: "Vote removed successfully"})

        }

        return res.status(500).json({message: err.message || "Internal Server Error"});
    }
    
});

router.delete("/post/:postId", authMiddleWare, adminMiddleWare, async (req, res) => {

    try{

        const postId = req.params.postId;

        if(!mongoose.Types.ObjectId.isValid(postId)){
        res.status(400).json({message: "Invalid post Id"});
        return;
        }

        const deletedPost = await Post.findByIdAndDelete(postId);

        if(!deletedPost){
            return res.status(404).json({message: "Post not founde."});
        }

        await Vote.deleteMany({postID: postId});

        res.status(200).json({
            message: "Post deleted successfully",
            post: deletedPost
        });

    } catch(err){
        return res.status(500).json({message: err.message || "Internal server error"});
    }
    
});

router.post("/:postId/comment", authMiddleWare, async (req, res) => {

    try{
        const {success, data} = commentZodSchema.safeParse(req.body);

        if(!success){
            res.status(400).json({message: "Invalid format"});
            return;
        }

    const postId = req.params.postId;
    if(!mongoose.Types.ObjectId.isValid(postId)){
        res.status(400).json({message: "Invalid post Id"});
        return;
    }

    await Post.findByIdAndUpdate(
        postId,
        {
            $push: {
                comments: {
                    name: data.name,
                    text: data.comment
                }
            }
        },
        {new: true, runValidators: true}
    );

    return res.status(201).json({message: "Comment added successfully"});
    } catch(err){
        return res.status(500).json({message: err.message || "Internal server error"});
    }

});

module.exports = router;