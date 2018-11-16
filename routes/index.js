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

//// SETUP OF DATABASE SCHEMA ////

// Artist DB
var artistSchema = mongoose.Schema({
    artistNickname: String,
    artistCompanyName: String,
    artistAddress: String,
    artistAddressLat: Number,
    artistAddressLon: Number,
    artistEmail:String,
    artistPhotoLink : String,
    artistStyleList : [String],
});
var ArtistModel = mongoose.model('artists', artistSchema);

// Tattoo DB
var tattooSchema = mongoose.Schema({
    tattooPhotoLink: String,
    tattooStyleList: [String],
    artistID:String,
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
    userTattooHeight : Number,
    userTattooWidth: Number,
    userTattooStyleList: [String],
    userTattooZone : String,
    userImportedPhotosLinks: [String],
    userFavoriteTattoo : [tattooSchema],
    userFavoriteArtist : [artistSchema],
});
var UserModel = mongoose.model('users', userSchema);

// Leads DB
var leadSchema = mongoose.Schema({
    dateLead: Number,
    userID: String,
    artistID: String,
});
var LeadModel = mongoose.model('leads', leadSchema);




//// INITIALISATION OF DATABASES ////

// Artist DB
var ArtistDB = [
  {
    artistNickname : "Bichon",
    artistCompanyName : "The Golden Rabbit Tattoo",
    artistAddress: "16 Rue Geoffroy-Marie, 75009 Paris",
    artistEmail: "bichontatoueur@gmail.com",
    artistComputerPhotoLink : "../FindMyTattooFront/public/avatarsTatoueurs/11201563_749803451831654_737090053_a.jpg",
    artistStyleList : ["Japopnais", "Postmodern"],
    },
 {
   artistNickname : "Princesse Madness",
   artistCompanyName : "Lez'art du Corps - Paris",
   artistAddress: "10 Rue Gambey, 75011 Paris, France, 75011 Paris",
   artistEmail: "princess-madness@hotmail.com",
   artistComputerPhotoLink : "../FindMyTattooFront/public/avatarsTatoueurs/41450515_1897257143642841_5668628696324374528_n.jpg",
   artistStyleList : ["Tribal", "OldSchool"],
 }
];



//// Enrichissement de la base de données tatoueurs avec coordonnées GPS ////
// To learn more on how to convert addresses to coordinates, check this simple website : https://dzone.com/articles/mapboxs-api-to-geocode-data-to-get-location-inform


var ArtistDBAddress=ArtistDB.map(a=>a.artistAddress);

// for (var i = 0; i < ArtistDBAddress.length; i++) {
//   var j=0;
//   var k=0;
//   request('https://api.mapbox.com/geocoding/v5/mapbox.places/'+ ArtistDBAddress[i]+'.json?access_token=pk.eyJ1IjoiZml0emZvdWZvdSIsImEiOiJjam9nMGlkMXowOTkzM3h0N3E5am45b3hxIn0.IBgvst88EucTyqijWWnpSg', function(error, response, body){
//     addressInfo=JSON.parse(body);
//     ArtistDB[j].artistAddressLat = addressInfo.features[0].center[1];
//     ArtistDB[j].artistAddressLon = addressInfo.features[0].center[0];
//     console.log(ArtistDB[j].artistComputerPhotoLink);
//     cloudinary.v2.uploader.upload(ArtistDB[j].artistComputerPhotoLink, function(error, result){
//       console.log(result.secure_url, error);
//       ArtistDB[k].artistPhotoLink = result.secure_url;
//       var newArtist = new ArtistModel (ArtistDB[k]);
//       newArtist.save(
//         function (error, artist) {
//           console.log(artist);
//         }
//       );
//       k++;
//     });
//     j++;
//   });
// }

// Tattoo DB
var TattooPhotoDBBichon = fs.readdirSync('../FindMyTattooFront/public/tatouagesBichon/');
var TattooPhotoDBPrincesse = fs.readdirSync('../FindMyTattooFront/public/tatouagesPrincess/');

var TattooDB = new Array(TattooPhotoDBBichon.length+ TattooPhotoDBPrincesse.length).fill({});

//Bichon tattoos
// for (var i = 0; i < TattooPhotoDBBichon.length; i++) {
//   var j =0;
//   cloudinary.v2.uploader.upload('../FindMyTattooFront/public/tatouagesBichon/'+TattooPhotoDBBichon[i], function(error, result){
//     console.log(result.secure_url, error);
//     TattooDB[j].tattooPhotoLink = result.secure_url;
//     TattooDB[j].artistID = '5bec5a385d12cb6484f788fe';
//     TattooDB[j].tattooStyleList = ["Japopnais","Postmodern"];
//     var newTattoo = new TattooModel (TattooDB[j]);
//     newTattoo.save(
//       function (error, tattoo) {
//         console.log(tattoo);
//       }
//     );
//     j++;
//   });
// }

//Princesse tattoos
// for (var i = 0; i < TattooPhotoDBPrincesse.length; i++) {
//   var j =0;
//   cloudinary.v2.uploader.upload('../FindMyTattooFront/public/tatouagesBichon/'+TattooPhotoDBBichon[i], function(error, result){
//     console.log(result.secure_url, error);
//     TattooDB[j].tattooPhotoLink = result.secure_url;
//     TattooDB[j].artistID = '5bec59adb061125c447856ed';
//     TattooDB[j].tattooStyleList = ["Tribal","OldSchool"];
//     var newTattoo = new TattooModel (TattooDB[j]);
//     newTattoo.save(
//       function (error, tattoo) {
//         console.log(tattoo);
//       }
//     );
//     j++;
//   });
// }

//// ROUTES ////

// Route to get all artists
router.get('/artists', function(req, res) {
  ArtistModel.find(
    function (err, artists) {
        console.log(artists);
        res.json(artists);
    }
  )
});

// Route to get all tattoos
router.get('/tattoos', function(req, res) {
  TattooModel.find(
    function (err, tattoos) {
        console.log(tattoos);
        res.json(tattoos);
    }
  )
});

// Route to create new user
var salt = "$2a$10$s7Re1cyDCCMTQeRTJiLUSO"; //To crypt the user password
router.post('/signup', function(req, res) {
  var hash = bcrypt.hashSync(req.body.userPassword, salt);
  var newUser = new UserModel ({
    userFirstName: req.body.userFirstName,
    userLastName: req.body.userLastName,
    userEmail: req.body.userEmail,
    userPassword:hash,
    userTelephone : "",
    userTattooDescription: "",
    userTattooHeight : 0,
    userTattooWidth: 0,
    userTattooStyleList: [],
    userTattooZone : "",
    userImportedPhotosLinks: [],
    userFavoriteTattoo : [],
    userFavoriteArtist : [],
    });
  newUser.save(
    function (error, user) {
      console.log(user);
      if (error){
        res.json({signup : false})
      } else {
        res.json({
          signup : true,
          result : user,
        })
      }
    }
  );
});

// Route to log in new user
router.post('/signin', function(req, res) {
  var hash = bcrypt.hashSync(req.body.userPassword, salt);
  UserModel.find(
    {userEmail:req.body.userEmail, userPassword: hash},
    function (err, users) {
      if (users.length>0) {
        res.json({
          signin : true,
          result : user,
        })
      } else{
        res.json({signin : false})
      }
    }
  )
});

// Route to update user favorite tattoos when he likes a tattoo
router.put('/userfavoritetattoo', function(req, res) {
  var newFavoriteTattoo = {
    tattooPhotoLink: req.query.favTattooPhotoLink,
    tattooStyleList: req.query.favTattooStyleList,
    artistID:req.query.favArtistID,
  };
  UserModel.updateOne(
    {_id: req.query.user_id},
    {$addToSet: {userFavoriteTattoo: newFavoriteTattoo}},
    function (err, raw) {
      if(err){
        res.json({favTattoo : false})
      } else{
        res.json({
          favTattoo: true
        });
      }
    }
  )
});

// Route to update user favorite artists when he likes an artist
router.put('/userfavoriteartist', function(req, res) {
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
        res.json({favArtist : false})
      } else{
        res.json({
          favArtist: true
        });
      }
    }
  )
});

//Route to get all information of a specific user
router.get('/user', function(req, res) {
  ArtisModel.findOne(
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
