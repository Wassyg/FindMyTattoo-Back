var request = require('request');
var cheerio = require('cheerio');

var ArtistDB = [
  {
    artistNickname : "Bichon",
    artistCompanyName : "The Golden Rabbit Tattoo",
    artistAddress: "16 Rue Geoffroy-Marie, 75009 Paris",
    artistEmail: "bichontatoueur@gmail.com",
    artistComputerPhotoLink : "../FindMyTattooFront/public/avatarsTatoueurs/11201563_749803451831654_737090053_a.jpg",
    artistStyleList : ["Japopnais", "Postmodern"],
    artistNote : 4.4,
  },
];

request('https://www.tattoome.com/fr/org/134/kalie-art-tattoo#',
function(err, response ,body){
  const $ = cheerio.load(body)
  ArtistDB.push(
    {
      artistNickname : $('.studio_tatoueurs li:nth-child(1):first-child').text(),
      artistCompanyName : $('.studio_content_header span:first-child').text(),
      artistAddress: $('.studio_localisation_adresse p:nth-child(2)').text() + " "+ $('.studio_localisation_adresse p:nth-child(3)').text()+" "+$('.studio_localisation_adresse p:nth-child(4)').text()+" "+$('.studio_localisation_adresse p:nth-child(5)').text(),
      artistEmail: $('.studio_tatoueurs li:nth-child(1):first-child').text().toLowerCase()+ "@gfakemail.com",
      artistComputerPhotoLink : $('.carousel-inner:first-child:first-child').attr("src"),
      artistStyleList : ["Japopnais", "Postmodern"],
      artistNote : 4.4,
    }
  );
  console.log($('.carousel-inner'));
  console.log(ArtistDB[1]);
  //Method 2
  let headerTextDirect = $('.studio_content_header span:first-child').text();
  console.log("headerTextDirect",headerTextDirect);

  //Method 1
  let headerDiv = $('.studio_content_header');
  var headerDivChildren = $(headerDiv.children()[0]);
  var headerH1Children = $(headerDivChildren.children()[0]);
  var headerText = headerH1Children.text();
  console.log(headerText);
  }
);
