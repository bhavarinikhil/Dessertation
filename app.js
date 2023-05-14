var express = require("express");
const session = require('express-session')
var mysql = require("mysql2");
var bodyParser = require("body-parser");
var path = require('path');
const axios = require('axios');
const { render } = require("ejs");
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const webpush = require('web-push');

const API_KEY = "710a69fc709ed3cd81f47006f127045e"
let lastCityName = "Manchester"
//urlByLatLong = "https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+long+"&units=metric&appid="+API_KEY
app.use(session({ secret: 'd542647e613016b046efcc0102c20196', resave: true, saveUninitialized: true }))

const connection = mysql.createConnection({
    host: 'mysqldb',
    user: 'user',
    password: "password",
    database: 'weather-db'
});

// simple query
connection.query(
    'create table if not exists app_user (userid varchar(200) PRIMARY KEY, password varchar(200), username varchar(200), recommendation varchar(200))',
    function (err, results, fields) {
        console.log(err);
    }
);

app.get("/", function (request, response) {

    response.render("login", { loginMessage: "", signupmessage: "" })

});

app.get("/logout", function (request, response) {
    request.session.user = "";
    response.render("login", { loginMessage: "", signupmessage: "" })

});

app.post("/login", function (request, response) {
    const { userId, password } = request.body;
    connection.query(
        'select * from  app_user  where userid = "' + userId + '"  and  password ="' + password + '"',
        function (err, results, fields) {
            console.log(err);
            if (results.length == 0) {
                response.render("login", { loginMessage: "Invalid login", signupmessage: "" })
            }
            else {
                request.session.user = userId;
                weatherByCityName(request, response, "Manchester");
            }

        }
    );

});

app.post("/signup", function (request, response) {
    const { userId, userName, password } = request.body;
    connection.query(
        'insert into app_user  (userid, userName, password) values ("' + userId + '","' + userName + '","' + password + '")',
        function (err, results, fields) {

            if (err != null) {
                response.render("login", { loginMessage: "", signupmessage: "UserId Already Exists" })
            }

            else {
                response.render("login", { loginMessage: "", signupmessage: "Signed up Successfully" })
            }

        }
    );

});

app.get("/home", function (request, response) {
    cityName = "Manchester"
    if (request.query.cityName != undefined) {
        cityName = request.query.cityName
    }
    weatherByCityName(request, response, cityName);
});

app.get("/personalize", function (request, response) {
    personalize(request, response, "")
});

function personalize(request, response, message) {
    connection.query(
        'select recommendation from app_user where userId="' + request.session.user + '"',
        function (err, results, fields) {
            rec = {}
            rec["clear"] = ""
            rec["storm"] = ""
            rec["snow"] = ""
            rec["haze"] = ""
            rec["cloud"] = ""
            rec["rain"] = ""
            rec["frequency"] = ""
            if (results != null && results.length > 0 && results[0]["recommendation"] != null) {
                console.log(results)

                rec["clear"] = results[0]["recommendation"].split("|")[0]
                rec["storm"] = results[0]["recommendation"].split("|")[1]
                rec["snow"] = results[0]["recommendation"].split("|")[2]
                rec["haze"] = results[0]["recommendation"].split("|")[3]
                rec["cloud"] = results[0]["recommendation"].split("|")[4]
                rec["rain"] = results[0]["recommendation"].split("|")[5]
                rec["frequency"] = results[0]["recommendation"].split("|")[6]

                response.render("personalize", { message: message, recommendation: rec })
            } else {
                response.render("personalize", { message: message, recommendation: rec })
            }
        })
}

app.post("/personalize", function (request, response) {
    const { clear, storm, snow, haze, cloud, rain, frequency } = request.body;
    recommendation = clear + "|" + storm + "|" + snow + "|" + haze + "|" + cloud + "|" + rain + "|" + frequency
    connection.query(
        'update app_user set recommendation ="' + recommendation + '"  where userId=("' + request.session.user + '")',
        function (err, results, fields) {

            if (err != null) {
                personalize(request, response, "Failed to update")
            }

            else {
                personalize(request, response, "Successfully submitted")
            }

        }
    );


});


app.get("/getByLatLong/:lat/:long", function (request, response) {
    if (request.params["lat"] == 'js') {

    } else {
        url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + request.params["lat"] + "&lon=" + request.params["long"] + "&zoom=18&addressdetails=1"
        // url = "https://api.openweathermap.org/data/2.5/forecast?lat="+ request.params["lat"]+"&lon="+ request.params["long"]+"&appid="+API_KEY
        axios.get(url)
            .then(res => {
                console.log(res)
                if (res["data"] != undefined && res["data"]["address"] != undefined && res["data"]["address"]["city"] != undefined) {
                    lastCityName = res["data"]["address"]["city"]
                } else if (res["data"] != undefined && res["data"]["address"] != undefined && res["data"]["address"]["town"] != undefined) {
                    lastCityName = res["data"]["address"]["town"]
                }
                response.send(lastCityName)
                //weatherByCityName(response, lastCityName)

            })
            .catch(err => {
                //weatherByCityName(response, lastCityName)
                console.log(err);
            });
    }


});

//start the server
app.listen(5000, function (request, response) {
    console.log("Server started and listening http://localhost:5000");

});

function weatherByCityName(request, response, cityName) {
    urlByCity = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=metric&appid=" + API_KEY;
    urlByLatLong = "https://api.openweathermap.org/data/2.5/weather?lat=&lon=&units=metric&appid=" + API_KEY;

    connection.query(
        'select recommendation from app_user where userId="' + request.session.user + '"',
        function (err, results, fields) {
            dress = {}
            dress["clear"] = "T-Shirt, Pant, Shirt, Cotton pants"
            dress["storm"] = "sleveless jacket, jean"
            dress["snow"] = "Winter-Jacket, Jean, Shoes"
            dress["haze"] = "Sleveless tshirt, shorts, cotton pants"
            dress["cloud"] = "Rain-coat, Jean"
            dress["rain"] = "Rain-coat, Jean, Shirt, Jacket"
            if (results != null && results.length > 0 && results[0]["recommendation"] != null) {
                console.log(results)

                dress["clear"] = results[0]["recommendation"].split("|")[0]
                dress["storm"] = results[0]["recommendation"].split("|")[1]
                dress["snow"] = results[0]["recommendation"].split("|")[2]
                dress["haze"] = results[0]["recommendation"].split("|")[3]
                dress["cloud"] = results[0]["recommendation"].split("|")[4]
                dress["rain"] = results[0]["recommendation"].split("|")[5]

                setTimeout(() => sendPush(dress, cityName), results[0]["recommendation"].split("|")[6] * 1000);
            }

            axios.get(urlByCity)
                .then(res => {
                    const data = res.data;
                    const city = data.name;
                    const country = data.sys.country;
                    const { description, id } = data.weather[0];
                    const { temp, feels_like, humidity } = data.main;
                    let result = {};
                    let key = "clear";
                    if (id == 800) {
                        result["wIcon"] = "../images/icons/clear.svg";
                        key = "clear"
                    } else if (id >= 200 && id <= 232) {
                        result["wIcon"] = "../images/icons/storm.svg";
                        key = "storm"
                    } else if (id >= 600 && id <= 622) {
                        result["wIcon"] = "../images/icons/snow.svg";
                        key = "snow"
                    } else if (id >= 701 && id <= 781) {
                        result["wIcon"] = "../images/icons/haze.svg";
                        key = "haze"
                    } else if (id >= 801 && id <= 804) {
                        result["wIcon"] = "../images/icons/cloud.svg";
                        key = "cloud"
                    } else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
                        result["wIcon"] = "../images/icons/rain.svg";
                        key = "rain"
                    }

                    result["temp"] = Math.floor(temp);
                    result["description"] = description;
                    result["location"] = `${city}, ${country}`;
                    result["feels_like"] = Math.floor(feels_like);
                    result["humidity"] = `${humidity}%`;
                    result["recommendation"] = dress[key];
                    response.render('home', { response: result, userId: request.session.user });
                })
                .catch(err => {
                    console.log(err);
                });

        })



}

webpush.setVapidDetails("mailto:dummy@gmail.com", "BH3b2DZ7U5qy9lnkTDtCFZ9shehFOU3FWhCYml2gQHOn3p57ZEdOeIjOEcxLWZaikm0r2-WSMUODOWedq0ZR_dU", "UtUphrR550tTY2hYZ7DM3jfXAY8t_ZX6PEpcjZ2CTg8");
let subscription = {}

async function sendPush(dress, cityName) {
    urlByCity = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=metric&appid=" + API_KEY;
    urlByLatLong = "https://api.openweathermap.org/data/2.5/weather?lat=&lon=&units=metric&appid=" + API_KEY;

    console.log("before notify")
    while (true) {
        await delay(dress['frequency'] * 1000);
        if ("endpoint" in subscription) {
            axios.get(urlByCity)
                .then(res => {
                    const data = res.data;
                    const city = data.name;
                    const country = data.sys.country;
                    const { description, id } = data.weather[0];
                    const { temp, feels_like, humidity } = data.main;
                    let result = {};
                    let key = "clear";
                    if (id == 800) {
                        result["wIcon"] = "../images/icons/clear.svg";
                        key = "clear"
                    } else if (id >= 200 && id <= 232) {
                        result["wIcon"] = "../images/icons/storm.svg";
                        key = "storm"
                    } else if (id >= 600 && id <= 622) {
                        result["wIcon"] = "../images/icons/snow.svg";
                        key = "snow"
                    } else if (id >= 701 && id <= 781) {
                        result["wIcon"] = "../images/icons/haze.svg";
                        key = "haze"
                    } else if (id >= 801 && id <= 804) {
                        result["wIcon"] = "../images/icons/cloud.svg";
                        key = "cloud"
                    } else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
                        result["wIcon"] = "../images/icons/rain.svg";
                        key = "rain"
                    }

                    result["temp"] = Math.floor(temp);
                    result["description"] = description;
                    result["location"] = `${city}, ${country}`;
                    result["feels_like"] = Math.floor(feels_like);
                    result["humidity"] = `${humidity}%`;
                    result["recommendation"] = dress[key];
                    let messageBody = JSON.stringify({ title: "Weather Recommentation", body: "Current temperature is " + result["temp"] + "c which feels like " + result["feels_like"] + ". We recommend you to wear " + result["recommendation"] })
                    webpush.sendNotification(subscription, messageBody).catch(console.log);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }



}

const delay = ms => new Promise(res => setTimeout(res, ms));



app.post('/register', (req, res) => {
    subscription = req.body;
    console.log(req.body)
    console.log(subscription)
    res.status(201).json({});
    const payload = JSON.stringify({ title: "Weather Recommentation", body: "Push Notification Registration" });

    console.log(payload)
    console.log(subscription.endpoint)
    webpush.sendNotification(subscription, payload).catch(console.log);
    console.log(subscription.endpoint)
})
