const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const { check, validationResult, body } = require('express-validator');

// @route GET api/profile/me
// @desc Get current user profile
// @access private
const getMyProfile = async (req, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.user.id,
      }).populate('User', ['name', 'avatar']);
  
      if (!profile) {
        return res.status(404).json({ msg: 'There is no profile for this user' });
      }
  
      res.json(profile);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  }
  router.get('/me', auth, getMyProfile);
  
  // @route Post api/profile
  // @desc create or update user profile
  // @access private
  const createProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;
  
    let skillList = skills.split(',');
    skillList = skillList.map((skill) => skill.trim());
  
    const profileField = {
      user: req.user.id,
      company,
      location,
      website,
      bio,
      skills: skillList,
      status,
      githubusername,
      social: { youtube, twitter, instagram, linkedin, facebook },
    };
  
    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileField },
        { new: true, upsert: true }
      );
  
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
  router.post(
    '/',
    [
      auth,
      [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills are required').not().isEmpty(),
      ],
    ],
    createProfile
  );
  
  // @route Get api/profile
  // @desc get all profiles
  // @access public
  const getAllProfile = async (req, res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
  router.get('/', getAllProfile);
  
  // @route Get api/profile/user/:user_id
  // @desc get profile by user id
  // @access public
  const getProfileById = async (req, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.params.user_id,
      }).populate('user', ['name', 'avatar']);
      if (!profile) {
        return res.status(400).json({ msg: 'There is no profile for this user' });
      }
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
  router.get('/user/:user_id', getProfileById);
  
  // @route Delete api/profile
  // @desc delete profile, posts, and users
  // @access private
  const deleteProfile = async (req, res) => {
    try {
      // delete posts
      await Post.deleteMany({ user: req.user.id });
      // delete profile
      await Profile.findOneAndDelete({ user: req.user.id });
      const user = await User.findOneAndDelete({ _id: req.user.id });
  
      res.json('User deleted');
    } catch (err) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
  router.delete('/', auth, deleteProfile);
  