


// console.log(tattooDBCreationWithLocalImages('../../FindMyTattooFront/public/tatouagesBichon/', 'Bichon'));

// var TattooPhotoDBBichon = fs.readdirSync('../../FindMyTattooFront/public/tatouagesBichon/');
// var TattooPhotoDBPrincess = fs.readdirSync('../../FindMyTattooFront/public/tatouagesPrincess/');
//
// var TattooDBBichon = TattooPhotoDBBichon.map(function(tattoo, i){
//   return {
//     tattooComputerPhotoLink: '../../FindMyTattooFront/public/tatouagesBichon/'+tattoo,
//     tattooStyleList : ["DotWork", "FineLine", "BlackWork"],
//     artistID : "5bf826a8483b5759d0b87c9f",
//     artistNickname : "Bichon"
//   }
// })
// var TattooDBPrincess = TattooPhotoDBPrincess.map(function(tattoo, i){
//   return {
//     tattooComputerPhotoLink: '../../FindMyTattooFront/public/tatouagesPrincess/'+tattoo,
//     tattooStyleList : ["Cartoon", "NewSchool", "Postmodern"],
//     artistID : "5bf826ac483b5759d0b87ca0",
//     artistNickname : "Princess Madness"
//   }
// })
// var TattooDB = TattooDBBichon.concat(TattooDBPrincess);
// console.log(TattooDB);

// var TattooDB = [];


//// ARTIST SCRAPING FUNCTION ////
var scraper = function(url, tattooDatabase){
  request(url,
    async function(err, response ,body){
      var $ = cheerio.load(body);
      var artistTemp ="";
      ArtistModel.findOne(
        {artistNickname : $('.studio_tatoueurs li:nth-child(1):first-child').text()},
        function (err, artist) {
          // tattooDatabase[i].artistID = artist._id;
          artistTemp = artist._id;
        }
      );
      await timeoutPromise(2000);
      for (var i = 1; i < 6; i++) {
        var element = {
          tattooComputerPhotoLink : "https://www.tattoome.com"+$('.carousel-inner img')[i].attribs.src,
          tattooStyleList : [
            $('.tab-pane .resultat_content_texte_tag:nth-child(2)').first().text(),
            $('.tab-pane .resultat_content_texte_tag:nth-child(3)').first().text(),
            $('.tab-pane .resultat_content_texte_tag:nth-child(4)').first().text()
          ],
          artistID : artistTemp,
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
    console.log(i, tattooLink[i]);
    scraper(tattooLink[i], testDB);
    await timeoutPromise(3000);
  }
  await timeoutPromise(5000);
  console.log(testDB);
}
// test();


// scraper("https://www.tattoome.com/fr/org/2873/lagrif-bleue", []);

//// DATABASE ENRICHING (GPS COORD AND CLOUDINARY) FUNCTION ////
//// Enrichissement de la base de données tatoueurs avec coordonnées GPS ////
// To learn more on how to convert addresses to coordinates, check this simple website : https://dzone.com/articles/mapboxs-api-to-geocode-data-to-get-location-inform



const tattooTest = {
  tattooComputerPhotoLink: '../../FindMyTattooFront/public/tatouagesPrincess/26152096_172723956835408_8529291745429553152_n.jpg',
  tattooStyleList : ["Cartoon", "NewSchool", "Postmodern"],
  artistID : "5bf826ac483b5759d0b87ca0",
  artistNickname : "Princess Madness"
}

async function testAsync() {
  await pushTattooPhotoOnCloudinary(tattooTest, 100);
  createNewTattooInDB(tattooTest);
}
// testAsync();



var enrichingTattooDB = async function(tattooDatabase){
  for (var i = 0; i < tattooDatabase.length; i++) {
    await timeoutPromise(2000);
    cloudinary.v2.uploader.upload(tattooDatabase[i].tattooComputerPhotoLink, {public_id: "tattoos/tattoo_"+i}, async function(error, result){
      console.log(result.secure_url, error);
      tattooDatabase[i].tattooPhotoLink = result.secure_url;
      await timeoutPromise(500);
      var newTattoo = new TattooModel (tattooDatabase[i]);
      newTattoo.save(
        function (error, tattoo) {
          console.log(tattoo);
        }
      );
    });
    console.log(i);
  }
}

//// FUNCTION TO CREATE ARTIST DATABASE ON MONGO DB WITH ALL INFO ////
async function createTattooDB() {
  for (var i = 0; i < tattooLink.length; i++) {
    console.log(i, tattooLink[i]);
    scraper(tattooLink[i], TattooDB);
    await timeoutPromise(3000);
  }
  await timeoutPromise(5000);
  console.log(TattooDB);
  enrichingTattooDB(TattooDB);
}

// createTattooDB();
