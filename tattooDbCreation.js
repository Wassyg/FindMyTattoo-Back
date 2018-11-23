var request = require('request');
var cheerio = require('cheerio');
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
    artistID:String,
});
var TattooModel = mongoose.model('tattoos', tattooSchema);


//// INITIAL DATABASE ////
// Tattoo DB

var TattooPhotoDBBichon = fs.readdirSync('../FindMyTattooFront/public/tatouagesBichon/');
var TattooPhotoDBPrincess = fs.readdirSync('../FindMyTattooFront/public/tatouagesPrincess/');

var TattooDBBichon = TattooPhotoDBBichon.map(function(tattoo, i){
  return {
    tattooComputerPhotoLink: '../FindMyTattooFront/public/tatouagesBichon/'+tattoo,
    tattooStyleList : ["DotWork", "FineLine", "BlackWork"],
    artistID : "",
    artistNickname : "Bichon"
  }
})
var TattooDBPrincess = TattooPhotoDBPrincess.map(function(tattoo, i){
  return {
    tattooComputerPhotoLink: '../FindMyTattooFront/public/tatouagesPrincess/'+tattoo,
    tattooStyleList : ["Cartoon", "NewSchool", "Postmodern"],
    artistID : "",
    artistNickname : "Princess Madness"
  }
})
var TattooDB = TattooDBBichon.concat(TattooDBPrincess);
console.log(TattooDB);

// var TattooDB = [];

//// LINKS OF ARTISTS TO SCRAP ////
var tattooLink = [
  "https://www.tattoome.com/fr/org/2873/lagrif-bleue",
  "https://www.tattoome.com/fr/org/134/kalie-art-tattoo#",
  "https://www.tattoome.com/fr/org/2901/marlene-le-cidre-",
  "https://www.tattoome.com/fr/org/2872/chez-meme",
  "https://www.tattoome.com/fr/org/236/soul-vision-tattoo"
];

//// USEFUL FUNCTION TO DELAY LAUNCH OF FOLLOWING FUNCTION ////
const timeoutPromise = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

//// ARTIST SCRAPING FUNCTION ////
var scraper = function(url, tattooDatabase){
  request(url,
    async function(err, response ,body){
      var $ = cheerio.load(body);
      for (var i = 1; i < 5; i++) {
        var element = {
          tattooComputerPhotoLink : "https://www.tattoome.com"+$('.carousel-inner img')[i].attribs.src,
          tattooStyleList : [
            $('.tab-pane .resultat_content_texte_tag:nth-child(2)').first().text(),
            $('.tab-pane .resultat_content_texte_tag:nth-child(3)').first().text(),
            $('.tab-pane .resultat_content_texte_tag:nth-child(4)').first().text()
          ],
          artistID : "",
          artistNickname : $('.studio_tatoueurs li:nth-child(1):first-child').text(),
        }
        tattooDatabase.push(element);
        await timeoutPromise(1000);
      }
    }
  )
}
var testDB=[];
async function test() {
  for (var i = 0; i < tattooLink.length; i++) {
    await timeoutPromise(1000);
    scraper(tattooLink[i], testDB);
    console.log(tattooLink[i]);
  }
  console.log(testDB);
}
test();


// scraper("https://www.tattoome.com/fr/org/2873/lagrif-bleue", []);

//// DATABASE ENRICHING (GPS COORD AND CLOUDINARY) FUNCTION ////
//// Enrichissement de la base de données tatoueurs avec coordonnées GPS ////
// To learn more on how to convert addresses to coordinates, check this simple website : https://dzone.com/articles/mapboxs-api-to-geocode-data-to-get-location-inform
var enrichingTattooDB = async function(tattooDatabase){
  for (var i = 0; i < tattooDatabase.length; i++) {
    ArtistModel.findOne(
      {artistNickname : tattooDatabase[i].artistNickname},
      function (err, artist) {
        tattooDatabase[i].artistID = artist._id;
      }
    )
    await timeoutPromise(1000);
    cloudinary.v2.uploader.upload(tattooDatabase[i].tattooComputerPhotoLink, {public_id: "tattoos/tattoo_"+i}, function(error, result){
      console.log(result.secure_url, error);
      tattooDatabase[i].tattooPhotoLink = result.secure_url;
      console.log(tattooDatabase[i]);
      var newTattoo = new TattooModel (tattooDatabase[i]);
      newTattoo.save(
        function (error, tattoo) {
          console.log(tattoo);
        }
      );
    });
    console.log(i);
    await timeoutPromise(1500);
  }
}

//// FUNCTION TO CREATE ARTIST DATABASE ON MONGO DB WITH ALL INFO ////
async function createTattooDB() {
  for (var i = 0; i < tattooLink.length; i++) {
    await timeoutPromise(1000);
    scraper(tattooLink[i], TattooDB);
  }
  await timeoutPromise(5000);
  console.log(TattooDB);
  enrichingTattooDB(TattooDB);
}

// createTattooDB();
