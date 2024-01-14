
const express = require('express');
const router = express.Router();
const userModel = require("./users");
const postModel =require("./post");
const passport = require("passport");
const localStrategy = require('passport-local');
const upload=require("./multer")

passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {nav:false});
});

router.get('/register', function (req, res, next) {
  res.render('register', {nav:false});
});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user=await userModel.findOne({username: req.session.passport.user}).populate("posts");
  res.render("profile",{user, nav:true});
});
router.get('/show', isLoggedIn, async function (req, res, next) {
  const user=await userModel.findOne({username: req.session.passport.user}).populate("posts");
  res.render("show",{user, nav:true});
});
router.get('/add', isLoggedIn, async function (req, res, next) {
  const user=await userModel.findOne({username: req.session.passport.user});
  res.render('add',{user, nav:true});
});
router.get('/feed', isLoggedIn, async function (req, res, next) {
  const user=await userModel.findOne({username: req.session.passport.user});
  const posts=await postModel.find();
  res.render('feed',{user, posts, nav:true});
});

router.post('/fileupload', isLoggedIn , upload.single("file"), async function (req,res,next){
    const user=await userModel.findOne({username: req.session.passport.user});
    user.profileImage=req.file.filename;
    await user.save();
    res.redirect("/profile");
});
router.post('/createpost', isLoggedIn , upload.single("post"), async function (req,res,next){
  const user=await userModel.findOne({username: req.session.passport.user});
  const post= await postModel.create({
    user:user._id,
    title:req.body.Title,
    description:req.body.Description,
    image:req.file.filename
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("profile");
});
router.post('/register', function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact
  });

  userModel.register(data, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    });
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: '/'
}), function (req, res, next) { 
  res.redirect("/profile");
});

router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
