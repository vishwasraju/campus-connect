const express = require('express');
const {z} = require('zod');
const authMiddleWare = require('./auth.middleware');
const Post = require('./post');

// Zod schemas
const postSchema = z.object({
    category: z.string(),
    title: z.string(),
    description: z.string(),
    postVisibility: z.string(),
    name: z.string().optional()
});

const router = express.Router();

router.post("/post", authMiddleWare, async (req, res) => {

    const {success, data} = postSchema.safeParse(req.body);

    if(!success){
        return res.status(412).json({message: "Invalid format"});
    }

    const post = new Post({
        category: data.category,
        title: data.title,
        description: data.description,
        postVisibility: data.postVisibility,
        name: data.name
    });

    await Post.save();
    return res.status(201).json({message: "Posted Successfully"});

});

module.exports = router;