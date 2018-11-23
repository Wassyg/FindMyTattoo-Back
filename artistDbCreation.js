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

//// ARTIST SCHEMA ////
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


//// INITIAL DATABASE ////
var ArtistDB = [
  {
    artistNickname : "Bichon",
    artistCompanyName : "The Golden Rabbit Tattoo",
    artistAddress: "10 Rue Gambey, 75011 Paris, France, 75011 Paris",
    artistDescription: "Bichon tatoue depuis 10 ans. Il a commencé à l'âge de 14 ans avec sa grande soeur. Depuis il est passionné de tatouages.",
    artistEmail: "bichontatoueur@gmail.com",
    artistComputerPhotoLink : "../FindMyTattooFront/public/avatarsTatoueurs/11201563_749803451831654_737090053_a.jpg",
    artistStyleList : ["DotWork", "FineLine", "BlackWork"],
    artistNote : 5,
    },
 {
   artistNickname : "Princess Madness",
   artistCompanyName : "Lez'art du Corps - Paris",
   artistAddress: "16 Rue Geoffroy-Marie, 75009 Paris",
   artistDescription: "Princess Madness s'est d'abord lancée dans la mode. Elle aime le style cartoon et découvrir des belles personnalités.",
   artistEmail: "princess-madness@hotmail.com",
   artistComputerPhotoLink : "../FindMyTattooFront/public/avatarsTatoueurs/41450515_1897257143642841_5668628696324374528_n.jpg",
   artistStyleList : ["Cartoon", "NewSchool", "Postmodern"],
   artistNote : 5,
 }
];

//// LINKS OF ARTISTS TO SCRAP ////
var artistLink = [
  "https://www.tattoome.com/fr/org/2873/lagrif-bleue",
  "https://www.tattoome.com/fr/org/134/kalie-art-tattoo#",
  "https://www.tattoome.com/fr/org/2901/marlene-le-cidre-",
  "https://www.tattoome.com/fr/org/2872/chez-meme",
  "https://www.tattoome.com/fr/org/236/soul-vision-tattoo"
];

//// USEFUL FUNCTION TO DELAY LAUNCH OF FOLLOWING FUNCTION ////
const timeoutPromise = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

//// ARTIST SCRAPING FUNCTION ////
var scraper = function(url, artistDatabase){
  request(url,
    function(err, response ,body){
      var $ = cheerio.load(body);
      //Create new artist
      var element = {
        artistNickname : $('.studio_tatoueurs li:nth-child(1):first-child').text(),
        artistCompanyName : $('.studio_content_header span:first-child').text(),
        artistAddress:
          $('.studio_localisation_adresse p:nth-child(3)').text()+" "+
          $('.studio_localisation_adresse p:nth-child(4)').text()+" "+
          $('.studio_localisation_adresse p:nth-child(5)').text(),
        artistDescription : $('.tab-pane .description').first().text().substring(0,120)+"...",
        artistEmail: $('.studio_tatoueurs li:nth-child(1):first-child').text().toLowerCase()+ "@fakemail.com",
        artistComputerPhotoLink : "https://www.tattoome.com"+$('.carousel-inner img')[0].attribs.src,
        artistStyleList : [
          $('.tab-pane .resultat_content_texte_tag:nth-child(2)').first().text(),
          $('.tab-pane .resultat_content_texte_tag:nth-child(3)').first().text(),
          $('.tab-pane .resultat_content_texte_tag:nth-child(4)').first().text()
        ],
        artistNote : Math.floor(Math.random()*2)+3,
      }
      artistDatabase.push(element);
      console.log(artistDatabase);
    }
  )
}
// scraper("https://www.tattoome.com/fr/org/2873/lagrif-bleue", []);

//// DATABASE ENRICHING (GPS COORD AND CLOUDINARY) FUNCTION ////
//// Enrichissement de la base de données tatoueurs avec coordonnées GPS ////
// To learn more on how to convert addresses to coordinates, check this simple website : https://dzone.com/articles/mapboxs-api-to-geocode-data-to-get-location-inform
var enrichingArtistDB = async function(artistDatabase){
  var artistDatabaseAddress=artistDatabase.map(a=>a.artistAddress);
  console.log(artistDatabaseAddress);
  for (var i = 0; i < artistDatabaseAddress.length; i++) {
    request('https://api.mapbox.com/geocoding/v5/mapbox.places/'+ artistDatabaseAddress[i]+'.json?access_token=pk.eyJ1IjoiZml0emZvdWZvdSIsImEiOiJjam9nMGlkMXowOTkzM3h0N3E5am45b3hxIn0.IBgvst88EucTyqijWWnpSg', function(error, response, body){
      addressInfo=JSON.parse(body);
      artistDatabase[i].artistAddressLat = addressInfo.features[0].center[1];
      artistDatabase[i].artistAddressLon = addressInfo.features[0].center[0];
      cloudinary.v2.uploader.upload(artistDatabase[i].artistComputerPhotoLink, {public_id: "artists/artist_"+i}, function(error, result){
        console.log(result.secure_url, error);
        artistDatabase[i].artistPhotoLink = result.secure_url;
        console.log(artistDatabase[i]);
        var newArtist = new ArtistModel (artistDatabase[i]);
        newArtist.save(
          function (error, artist) {
            console.log(artist);
          }
        );
      });
    });
    console.log(i);
    await timeoutPromise(4000);
  }
}

// console.log(enrichingArtistDB(ArtistDB));

//// FUNCTION TO CREATE ARTIST DATABASE ON MONGO DB WITH ALL INFO ////
async function createArtistDB() {
  for (var i = 0; i < artistLink.length; i++) {
    await timeoutPromise(1000);
    scraper(artistLink[i], ArtistDB);
  }
  await timeoutPromise(5000);
  console.log(ArtistDB);
  enrichingArtistDB(ArtistDB);
}

createArtistDB();
