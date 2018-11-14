var express = require('express');
var router = express.Router();
var ctl_user = require('../controllers/user_controller');
var fileUpload = require("express-fileupload");
var path = require('path');
var fs = require('fs');

router.use(fileUpload());


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/');
    } else {
        next();
    }
};

// route for user logout
router.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
    }
    res.redirect('/');
});

/* POST user login. */
router.post('/login', sessionChecker, function (req, res, next) {
    console.log(req.body);

    //Get data from request and log user
    ctl_user.userController_Login(req.body['username'], req.body['password'], 
      function(success) {
        if (success instanceof Error){
          return res.send(success.message);
        }
        if(success){
          req.session.user = req.body['username'];
          res.redirect("/");
        } else {
          res.send("Wrong password");
        }
    });
});

/* GET user singup. */
router.get('/signup', function (req, res, next) {

  res.render('signup');
});

/* POST user register. */
router.post('/signup', function (req, res, next) {
  //TODO
  //Get data from request and log user
  var user = ctl_user.userController_Signup(req.body['email'], req.body['username'], req.body['password']);
  //router.put('/profileView/:userId', ctl_user.updateProfile); //To validate from merge
    console.log(user);
    res.redirect("/");
});

router.get('/:username/', function (req, res, next) {
  var username=req.params.username;
  console.log('Cookies: ', req.cookies);
    //Implementation
    ctl_user.getUserByUsername(username)
        .then(function(user){
            if (!user) return res.status(404).send("User Not found");
            res.render('user/user_activity', {
                username: user.username,
                imageURL: user.pictureLink,
                description: user.description,
                threads: [] }
            );
        }, function(err){
            console.log(err);
            res.status(500).send("Internal server error");
        });
});


/*
router.put('/profileView/:userId', function(req,res,next){
  //process req
  var userId = req.params.userId;
  var pictureLink = req.body.imageURL;
  var description = req.body.description;
  
  ctl_user.updateProfile(userId, pictureLink, description)
      .then(function(success){
        res.status(200).send(success);
      }, function(err){
        res.status(500).send(err);
      });
});
//router.get('/profileView/:userId', ctl_user.getUserById); //To validate from merge

router.get('/profileView/:userId', function(req,res,next){
  //process req
  var userId = req.params.userId;

  ctl_user.getUserById(userId)
      .then(function(user){
        console.log(user);
        res.json(user);
      }, function(err){
        console.log(err);
        res.status(500).send(err);
      });
});
*/

router.get('/:username/settings', function (req, res, next) {
  //process req
  var username = req.params.username;

  //Implementation
  ctl_user.getUserByUsername(username)
      .then(function(user){
        if (!user) return res.status(404).send("User Not found");
        res.render('user/user_settings', {
          username: user.username,
          imageURL: user.pictureLink,
          description: user.description,
          threads: [] }
        );
      }, function(err){
        console.log(err);
        res.status(500).send("Internal server error");
      });
});

function moveFile(file, somePlace) {
  return new Promise((resolve, reject) => {
    file.mv(somePlace, function (err) {
      if (err) return reject(err);

      resolve();
    });
  });
}

router.post('/:username/settings', function (req, res, next) {
  //process req
  var username = req.params.username;
  var description = req.body.description;
  var appDir = path.dirname(require.main.filename);

  //Implementation
  ctl_user.getUserByUsername(username)
      .then(function(user){
        ctl_user.updateProfile(user.id, description, null)
            .then(function(success){
            }, function(err){
              throw err;
            });
      }, function(err){
        throw err;
      });

  try {

    if (Object.keys(req.files).length > 0) {
      let filepath = appDir + "/../public/images/users/" + username;
      console.log(filepath);
      if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath, {recursive: true}, (err) => {
          if (err) throw err;
        });
      }
      const fileMovePromise =
          req.files ? moveFile(req.files.image, filepath + '/profile.jpg') : Promise.resolve('No file present');

      fileMovePromise
          .then(() => {

            //TODO:
            res.redirect("/users/" + username);
          })
          .catch(err => {
            console.log(err);
            res.status(500).json(err);
          });
    }
  } catch (err){
    res.status(500).send(err);
  }

  res.redirect("/users/"+username);
});

module.exports = router;
