const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Post = require('../../models/Post');

// @route post api/posts
// @desc create post
// @access private
const createPost = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const newPost = new Post({
        text: req.body.text,
        avatar: req.user.avatar,
        user: req.user.id,
        name: req.user.name,
      });
      // console.log(req.user);
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
  
  router.post(
    '/',
    [auth, [check('text', 'Text is required').trim().not().isEmpty()]],
    createPost
  );
  
  // @route    GET api/posts
  // @desc     Get all posts
  // @access   Private
  const getAllPosts = async (req, res) => {
    try {
      const posts = await Post.find().sort({ date: -1 });
      res.json(posts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
  router.get('/', auth, getAllPosts);
  
  // @route    GET api/posts/:id
  // @desc     Get post by ID
  // @access   Private
  const getPostById = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Check for ObjectId format and post
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      res.json(post);
    } catch (err) {
      console.error(err.message);
  
      res.status(500).send('Server Error');
    }
  }
  
  router.get('/:id', auth, getPostById);
  
  // @route    DELETE api/posts/:id
  // @desc     Delete a post
  // @access   Private
  const deletePostById = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Check for ObjectId format and post
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      // Check user
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      await post.remove();
  
      res.json({ msg: 'Post removed' });
    } catch (err) {
      console.error(err.message);
  
      res.status(500).send('Server Error');
    }
  }
  
  router.delete('/:id', auth, deletePostById);
  
  // @route    PUT api/posts/like/:id
  // @desc     Like a post
  // @access   Private
  const likePost = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Check if the post has already been liked
      if (
        post.likes.filter((like) => like.user.toString() === req.user.id).length >
        0
      ) {
        const removeIndex = post.likes
          .map((like) => like.user.toString())
          .indexOf(req.user.id);
  
        post.likes.splice(removeIndex, 1);
      } else {
        post.likes.unshift({ user: req.user.id });
      }
  
      await post.save();
  
      res.json(post.likes);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
router.put('/like/:id', auth, likePost);

// @route    PUT api/posts/unlike/:id
// @desc     Like a post
// @access   Private
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}
router.put('/unlike/:id', auth, unlikePost);

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
const commentPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const post = await Post.findById(req.params.id);

    const newComment = {
      text: req.body.text,
      name: req.user.name,
      avatar: req.user.avatar,
      user: req.user.id,
    };

    post.comments.unshift(newComment);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  commentPost
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.id)
      .indexOf(req.params.comment_id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}
router.delete('/comment/:id/:comment_id', auth, deletePost);
module.exports = router;
