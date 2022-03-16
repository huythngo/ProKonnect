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