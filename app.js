var express = require("express");
var bodyParser = require("body-parser");
var path = require('path');
const axios = require('axios')
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
const API_KEY ="d542647e613016b046efcc0102c20196"
let lastCityName = "Manchester"
//urlByLatLong = "https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+long+"&units=metric&appid="+API_KEY
   

app.get("/", function (request, response) {
    cityName = "Manchester"
    if(request.query.cityName!=undefined){
        cityName=request.query.cityName
    }
    
    weatherByCityName(response, cityName);
    
});


app.get("/getByLatLong/:lat/:long", function (request, response) {
    if(request.params["lat"]=='js'){

    }else{
        url="https://nominatim.openstreetmap.org/reverse?format=json&lat="+ request.params["lat"]+"&lon="+ request.params["long"]+"&zoom=18&addressdetails=1"
        // url = "https://api.openweathermap.org/data/2.5/forecast?lat="+ request.params["lat"]+"&lon="+ request.params["long"]+"&appid="+API_KEY
         axios.get(url)
         .then(res => {
             console.log(res)
             if(res["data"]!=undefined && res["data"]["address"]!=undefined && res["data"]["address"]["city"]!=undefined){
                lastCityName = res["data"]["address"]["city"]
             }else if(res["data"]!=undefined && res["data"]["address"]!=undefined && res["data"]["address"]["town"]!=undefined){
                lastCityName = res["data"]["address"]["town"]
             }
             response.send( lastCityName)
             //weatherByCityName(response, lastCityName)
                
         })
         .catch(err => {
            //weatherByCityName(response, lastCityName)
             console.log(err);
         });
    }
   
    
});

//start the server
app.listen(3000, function (request, response) {
    console.log("Server started and listening http://localhost:3000");

});

function weatherByCityName(response, cityName) {
    urlByCity = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=metric&appid=" + API_KEY;
    urlByLatLong = "https://api.openweathermap.org/data/2.5/weather?lat=&lon=&units=metric&appid=" + API_KEY;
    dress ={}
    dress["clear"] = "T-Shirt, Pant, Shirt, Cotton pants"
    dress["storm"]="sleveless jacket, jean"
    dress["snow"]="Winter-Jacket, Jean, Shoes"
    dress["haze"]="Sleveless tshirt, shorts, cotton pants"
    dress["cloud"]="Rain-coat, Jean"
    dress["rain"]="Rain-coat, Jean, Shirt, Jacket"
    axios.get(urlByCity)
        .then(res => {
            const data = res.data;
            const city = data.name;
            const country = data.sys.country;
            const { description, id } = data.weather[0];
            const { temp, feels_like, humidity } = data.main;
            let result = {};
            let key =  "clear";
            if (id == 800) {
                result["wIcon"] = "../images/icons/clear.svg";
                key =  "clear"
            } else if (id >= 200 && id <= 232) {
                result["wIcon"] = "../images/icons/storm.svg";
                key =  "storm"
            } else if (id >= 600 && id <= 622) {
                result["wIcon"] = "../images/icons/snow.svg";
                key =  "snow"
            } else if (id >= 701 && id <= 781) {
                result["wIcon"] = "../images/icons/haze.svg";
                key =  "haze"
            } else if (id >= 801 && id <= 804) {
                result["wIcon"] = "../images/icons/cloud.svg";
                key =  "cloud"
            } else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
                result["wIcon"] = "../images/icons/rain.svg";
                key =  "rain"
            }

            result["temp"] = Math.floor(temp);
            result["description"] = description;
            result["location"] = `${city}, ${country}`;
            result["feels_like"] = Math.floor(feels_like);
            result["humidity"] = `${humidity}%`;
            result["recommendation"] = dress[key];
            response.render('home', { response: result });
        })
        .catch(err => {
            console.log(err);
        });
}

