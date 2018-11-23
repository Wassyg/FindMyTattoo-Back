var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var options = { connectTimeoutMS: 5000, useNewUrlParser: true };
var cloudinary = require('cloudinary');
var fs = require('fs');
var bcrypt = require('bcryptjs');


var dbuser='fitzfoufou';
var dbpassword='lacapsule1';
mongoose.connect('mongodb://'+dbuser+':'+dbpassword+'@ds039301.mlab.com:39301/findmytattoo',
    options,
    function(err) {
     console.log(err);
    }
);

cloudinary.config({
  cloud_name: "crazycloud",
  api_key: '255876528863486',
  api_secret: '0qzSisIetVmja-LecM_n0PiH-CQ'
});

//// USEFUL FUNCTIONS ////

//Function to shuffle the list of tattoos and artists -- unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle : https://github.com/coolaj86/knuth-shuffle
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


//// SETUP OF DATABASE SCHEMA ////

// Artist DB
var artistSchema = mongoose.Schema({
    artistNickname: String,
    artistCompanyName: String,
    artistAddress: String,
    artistDescription: String,
    artistAddressLat: Number,
    artistAddressLon: Number,
    artistEmail:String,
    artistPhotoLink : String,
    artistStyleList : [String],
    artistNote : Number,
});
var ArtistModel = mongoose.model('artists', artistSchema);

// Tattoo DB
var tattooSchema = mongoose.Schema({
    tattooPhotoLink: String,
    tattooStyleList: [String],
    artistID: String,
    tattoo_id: String,

});
var TattooModel = mongoose.model('tattoos', tattooSchema);

// User DB
var userSchema = mongoose.Schema({
    userFirstName: String,
    userLastName: String,
    userEmail: String,
    userPassword:String,
    userTelephone : String,
    userTattooDescription: String,
    userAvailability : String,
    userFavoriteTattoo : [tattooSchema],
    userFavoriteArtist : [artistSchema],
});
var UserModel = mongoose.model('users', userSchema);

// Leads DB
var leadSchema = mongoose.Schema({
    dateLead: Number,
    userID: String,
    artistID: String,
    artistID: String,
    userAvailability : String,
    userTattooDescription : String,
});
var LeadModel = mongoose.model('leads', leadSchema);


//// ROUTES ////

// Route to get all artists
router.get('/artists', function(req, res) {
  ArtistModel.find(
    function (err, artists) {
      res.json(artists);
    }
  )
});

// Route to get all tattoos from specific artist
router.get('/tattoosfromartist', function(req, res) {
  TattooModel.find(
    {artistID: req.query.artistID },
    function (err, tattoos) {
      res.json(shuffle(tattoos));
    }
  )
});

// Route to get all tattoos
router.get('/tattoos', function(req, res) {
  TattooModel.find(
    function (err, tattoos) {
      res.json(shuffle(tattoos));
    }
  )
});

// Route to create new user
var salt = "$2a$10$rx6.LcM0Eycd3JfZuRVUsO"; //To crypt the user password
router.post('/signup', function(req, res) {
  UserModel.findOne(
    {userEmail: req.body.userEmail},
    function (err, user) {
      if (user) {
        console.log(user);
        res.json({
          signup : false,
          result : "alreadyInDB",
        });
      } else{
        var hash = bcrypt.hashSync(req.body.userPassword, salt);
        var newUser = new UserModel ({
          userFirstName: req.body.userFirstName,
          userLastName: req.body.userLastName,
          userEmail: req.body.userEmail,
          userPassword: hash,
          userTelephone : "",
          userTattooDescription: "",
          userAvailability : "",
          userFavoriteTattoo : [],
          userFavoriteArtist : [],
          });
        newUser.save(
          function (err, user) {
            if (err){
              res.json({
                signup : false,
                result : err
              })
            } else {
              res.json({
                signup : true,
                result : user,
              })
            }
          }
        );
      }
    }
  )
});

// Route to log in new user
router.post('/signin', function(req, res) {
  var hash = bcrypt.hashSync(req.body.userPassword, salt);
  UserModel.findOne(
    {userEmail: req.body.userEmail, userPassword: hash},
    function (err, user) {
      if (user) {
        res.json({
          signin : true,
          result : user,
        });
      } else{
        UserModel.findOne(
          {userEmail: req.body.userEmail},
          function (err, user) {
            if (user) {
              res.json({
                signup : false,
                result : "wrongPassword",
              });
            } else {
              res.json({
                signin : false,
                result: err
              });
            }
          }
        )
      }
    }
  )
});

// Route to update user favorite tattoos when he likes a tattoo
router.put('/userliketattoo', function(req, res) {
  console.log(req.body);
  var newFavoriteTattoo = {
    tattooPhotoLink: req.body.favTattooPhotoLink,
    tattooStyleList: req.body.favTattooStyleList,
    artistID: req.body.favArtistID,
    tattoo_id: req.body.idPhotoSelected,
  };
  UserModel.updateOne(
    {_id: req.body.user_id},
    {$addToSet: {userFavoriteTattoo: newFavoriteTattoo}},
    function (err, raw) {
      if(err){
        res.json({likeTattoo : false})
      } else{
        res.json({likeTattoo: true});
      }
    }
  )
});

// Route to update a user favorite tattoos when he dislikes a tattoo
router.put('/userdisliketattoo', function(req, res) {
  UserModel.updateOne(
    {_id: req.body.user_id},
    {$pull: {userFavoriteTattoo: {tattoo_id : req.body.idPhotoSelected}}},
    function (err, raw) {
      if(err){
        res.json({dislikeTattoo : false})
      } else{
        res.json({dislikeTattoo: true});
      }
    }
  )
});

// Route to update user favorite artists when he likes an artist
router.put('/userlikeartist', function(req, res) {
  var newFavoriteArtist = {
    artistNickname: req.query.favArtistNickname,
    artistCompanyName: req.query.favArtistCompanyName,
    artistAddress: req.query.favArtistAddress,
    artistAddressLat: req.query.favArtistAddressLat,
    artistAddressLon: req.query.favArtistAddressLon,
    artistEmail:req.query.favArtistEmail,
    artistPhotoLink : req.query.favArtistPhotoLink,
    artistStyleList : req.query.favArtistStyleList,
  };
  UserModel.updateOne(
    {_id: req.query.user_id},
    {$addToSet: {userFavoriteArtist: newFavoriteArtist}},
    function (err, raw) {
      if(err){
        res.json({likeArtist : false})
      } else{
        res.json({likeArtist: true});
      }
    }
  )
});

// Route to update user favorite artists when he dislikes an artist
router.put('/userdislikeartist', function(req, res) {
  UserModel.updateOne(
    {_id: req.query.user_id},
    {$pull: {userFavoriteArtist: {_id : req.query.artist_id}}},
    function (err, raw) {
      if(err){
        res.json({dislikeArtist : false})
      } else{
        res.json({dislikeArtist: true});
      }
    }
  )
});

//Route to get all information of a specific user
router.get('/user', function(req, res) {
  UserModel.findOne(
    {_id: req.query.user_id},
    function (err, user) {
      if (err){
        res.json({user : false})
      } else {
        console.log(user);
        res.json({
          user : true,
          result : user
        });
      }
    }
  )
});

//Route to get all information of a specific artist
router.get('/artist', function(req, res) {
  ArtistModel.findOne(
    {_id: req.query.artist_id},
    function (err, artist) {
      if (err){
        res.json({artist : false})
      } else {
        console.log(artist);
        res.json({
          artist : true,
          result : artist
        });
      }
    }
  )
});


//Route to create a new lead from user to artist
router.post('/newlead', function(req, res) {
  //Create a new lead
  var today = new Date();
  var newLead = new LeadModel ({
    dateLead: today,
    userID: req.body.user_id,
    artistID: req.body.artist_id,
    userAvailability : req.body.userAvailability,
    userTattooDescription : req.body.userTattooDescription,
  })
  newLead.save(
    function (error, lead) {
      console.log(lead);
      res.json(lead)
    }
  )
  //Update user information to add telephone
  UserModel.updateOne(
    {_id: req.query.user_id},
    {userTelephone: req.body.userTelephone},
    function (err, raw) {
      if(err){
        res.json({updateUser : false})
      } else{
        res.json({updateUser: true});
      }
    }
  )
});

// Initial route
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

//Route to get users - just for testing
router.get('/users', function(req, res) {
  UserModel.find(
    function (err, users) {
        console.log(users);
        res.json(users);
    }
  )
});
module.exports = router;
