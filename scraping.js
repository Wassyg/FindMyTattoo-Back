var request = require('request');
var cheerio = require('cheerio');

var ArtistDB = [];

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

      //Create new tattoo
    }
  )
}

var j=0
for (var i = 0; i < artistLink.length; i++) {
  scraper(artistLink[j], ArtistDB);
  j++;
}
