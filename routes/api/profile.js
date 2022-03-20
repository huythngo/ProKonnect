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
  
  // @route Update api/profile/experience
// @desc update experience
// @access private
const updateExperience = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      } = req.body;
      const newExperience = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };
  
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExperience);
  
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  }
  router.put(
    '/experience',
    [
      auth,
      [
        check('title', 'Title is required').trim().not().isEmpty(),
        check('company', 'Company is required').trim().not().isEmpty(),
        check('from', 'From field is invalid')
          .not()
          .isEmpty()
          .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
        check('to', 'To field is invalid').optional(),
      ],
    ],
    updateExperience
  );
  
  // @route Delete api/profile/experience/:exp_id
  // @desc delete experience
  // @access private
  const deleteExperience = async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ msg: 'There is no profile for this user' });
      }
      profile.experience = await profile.experience.filter(
        (exp) => exp._id.toString() !== req.params.exp_id
      );
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  }
  router.delete('/experience/:exp_id', auth, deleteExperience);
  
  // @route Update api/profile/education
  // @desc update education
  // @access private
  const updateEducation = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      } = req.body;
      const newEducation = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };
  
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res
          .status(400)
          .json({ msg: 'There is no profile for this user' });
      }
  
      profile.education.unshift(newEducation);
  
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  }
  router.put(
    '/education',
    [
      auth,
      [
        check('school', 'School is required').trim().not().isEmpty(),
        check('degree', 'degree is required').trim().not().isEmpty(),
        check('fieldofstudy', 'fieldofstudy is required').trim().not().isEmpty(),
        check('from', 'From field is invalid')
          .not()
          .isEmpty()
          .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
        check('to', 'To field is invalid').optional(),
      ],
    ],
    updateEducation
  );
  
  // @route Delete api/profile/education/:edu_id
  // @desc delete education
  // @access private
  const delEducation = async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ msg: 'There is no profile for this user' });
      }
      profile.education = await profile.education.filter(
        (edu) => edu._id.toString() !== req.params.edu_id
      );
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  }
  router.delete('/education/:edu_id', auth, delEducation);
  
  // @route Update api/profile/project
  // @desc update project
  // @access private
  const updateProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { name, description } = req.body;
      const newProject = {
        name,
        description,
      };
  
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res
          .status(400)
          .json({ msg: 'There is no profile for this user' });
      }
  
      profile.project.unshift(newProject);
  
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  }
  router.put(
    '/project',
    [auth, [check('name', 'Name is required').trim().not().isEmpty()]],
    updateProject
  );
  
  // @route Delete api/profile/project/:project_id
  // @desc delete project
  // @access private
  const delProject = async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ msg: 'There is no profile for this user' });
      }
      profile.project = await profile.project.filter(
        (proj) => proj._id.toString() !== req.params.project_id
      );
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  }
  router.delete('/project/:project_id', auth, delProject);
  // @route Get api/profile/github/:username
  // @desc get user repos from Github
  // @access public
  const getGitHubProfile = (req, res) => {
    try {
      const options = {
        uri: encodeURI(
          `https://api.github.com/users/${
            req.params.username
          }/repos?per_page=5&sort=created:asc&client_id=${config.get(
            'githubClientId'
          )}&client_secret=${config.get('githubSecret')}`
        ),
        method: 'GET',
        headers: { 'user-agent': 'node.js' },
      };
  
      request(options, (error, response, body) => {
        if (error) console.error(error);
  
        if (response.statusCode !== 200) {
          return res.status(404).json({ msg: 'No Github profile found' });
        }
  
        res.json(JSON.parse(body));
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
  router.get('/github/:username', getGitHubProfile);
  
  module.exports = router;
  