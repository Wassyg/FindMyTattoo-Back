var request = require('request');
var cheerio = require('cheerio');

// Artist DB
var ArtistDB = [
  {
    artistNickname : "Bichon",
    artistCompanyName : "The Golden Rabbit Tattoo",
    artistAddress: "10 Rue Gambey, 75011 Paris, France, 75011 Paris",
    artistDescription: "Bichon tatoue depuis 10 ans. Il a commencé à l'âge de 14 ans avec sa grande soeur. Depuis il est passionné de tatouages.",
    artistEmail: "bichontatoueur@gmail.com",
    artistComputerPhotoLink : "../FindMyTattooFront/public/avatarsTatoueurs/11201563_749803451831654_737090053_a.jpg",
    artistStyleList : ["DotWork", "FineLine", "BlackWork"],
    artistNote : 4.4,
    },
 {
   artistNickname : "Princess Madness",
   artistCompanyName : "Lez'art du Corps - Paris",
   artistAddress: "16 Rue Geoffroy-Marie, 75009 Paris",
   artistDescription: "Princess Madness s'est d'abord lancée dans la mode. Elle aime le style cartoon et découvrir des belles personnalités.",
   artistEmail: "princess-madness@hotmail.com",
   artistComputerPhotoLink : "../FindMyTattooFront/public/avatarsTatoueurs/41450515_1897257143642841_5668628696324374528_n.jpg",
   artistStyleList : ["Cartoon", "NewSchool", "Postmodern"],
   artistNote : 4.6,
 }
];

var artistLink = [
  "https://www.tattoome.com/fr/org/2873/lagrif-bleue",
  "https://www.tattoome.com/fr/org/134/kalie-art-tattoo#",
  "https://www.tattoome.com/fr/org/2901/marlene-le-cidre-",
  "https://www.tattoome.com/fr/org/2872/chez-meme",
  "https://www.tattoome.com/fr/org/236/soul-vision-tattoo"
];


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

var cloudinaryUploader = function (artist){
  cloudinary.v2.uploader.upload(artist.artistComputerPhotoLink,
    function(error, result){
      console.log(result.secure_url, error);
      artist.artistPhotoLink = result.secure_url;
      return artist
    }
  )
}

var coordinatesCalculation = function(artist){
  request('https://api.mapbox.com/geocoding/v5/mapbox.places/'+ artist.artistAddress+'.json?access_token=pk.eyJ1IjoiZml0emZvdWZvdSIsImEiOiJjam9nMGlkMXowOTkzM3h0N3E5am45b3hxIn0.IBgvst88EucTyqijWWnpSg', function(error, response, body){
    addressInfo=JSON.parse(body);
    artist.artistAddressLat = addressInfo.features[0].center[1];
    artist.artistAddressLon = addressInfo.features[0].center[0];
    return artist;
  });
}

async function processing(artistLink, initialDatabase){
  let finalDatabase = [];
  let enrichedDatabase = await scraper(artistLink[0], initialDatabase);
  let loopFunction = await
    async function() {
      for (var i = 0; i < enrichedDatabase.length; i++) {
      console.log(i);
      let artistWithCloudinaryLink = await cloudinaryUploader(enrichedDatabase[i]);
      let artistWithCloudinaryLinkAndGPS = await coordinatesCalculation(artistWithCloudinaryLink);
      finalDatabase.push(artistWithCloudinaryLinkAndGPS);
    };
  }
  console.log(finalDatabase);
  // return finalDatabase;
}

processing(artistLink, ArtistDB);
