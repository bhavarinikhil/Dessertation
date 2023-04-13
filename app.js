var express = require("express");
var bodyParser = require("body-parser");
var path = require('path');
const axios = require('axios')
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
const API_KEY = "d542647e613016b046efcc0102c20196"


app.get("/", function (request, response) {
    cityName = "Manchester"
    urlByCity = "https://api.openweathermap.org/data/2.5/weather?q="+cityName+"&units=metric&appid="+API_KEY
    urlByLatLong = "https://api.openweathermap.org/data/2.5/weather?lat=&lon=&units=metric&appid="+API_KEY
    axios.get(urlByCity)
    .then(res => {
        const data = res.data
        const city = data.name;
        const country = data.sys.country;
        const {description, id} = data.weather[0];
        const {temp, feels_like, humidity} = data.main;
        let result = {}
        if(id == 800){
            result["wIcon"] = "../images/icons/clear.svg";
        }else if(id >= 200 && id <= 232){
            result["wIcon"] = "../images/icons/storm.svg";  
        }else if(id >= 600 && id <= 622){
            result["wIcon"] = "../images/icons/snow.svg";
        }else if(id >= 701 && id <= 781){
            result["wIcon"] = "../images/icons/haze.svg";
        }else if(id >= 801 && id <= 804){
            result["wIcon"] = "../images/icons/cloud.svg";
        }else if((id >= 500 && id <= 531) || (id >= 300 && id <= 321)){
            result["wIcon"] = "../images/icons/rain.svg";
        }
        
        result["temp"] = Math.floor(temp);
        result["description"]  = description;
        result["location"]  = `${city}, ${country}`;
        result["feels_like"]  = Math.floor(feels_like);
        result["humidity"]  = `${humidity}%`;
     
        response.render('home', { response: result });
    })
    .catch(err => console.log(err))
    
});

//start the server
app.listen(3000, function (request, response) {
    console.log("Server started and listening http://localhost:3000");

});

