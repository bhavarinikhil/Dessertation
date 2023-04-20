const inputPart = document.querySelector(".input-part")
const inputField = inputPart.querySelector("input")
const locationBtn = inputPart.querySelector("button")

inputField.addEventListener("keyup", e => {

    if (e.key == "Enter" && inputField.value != "") {
        //requestApi(inputField.value);
    }
});

locationBtn.addEventListener("click", () => {
    console.log("called")
    if (navigator.geolocation) {
        console.log("current pos");
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        alert("Your browser not support geolocation api");
    }
});


function onSuccess(position){
    console.log("onsuccess");
    const {latitude, longitude} = position.coords; // getting lat and lon of the user device from coords obj
   document.getElementById("cityName").value=latitude
   document.getElementById("longitude").value=longitude

   const Http = new XMLHttpRequest();
    const url="http://localhost:3000/getByLatLong/"+latitude+"/"+longitude;
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = (e) => {
        
            console.log(Http.responseText)
            document.getElementById("cityName").value=Http.responseText
        
            
    }
   //const form = document.createElement('form');
 // form.method = "get";
  //form.action = "?latitude="+latitude+"&longitude="+longitude;
  //form.action = "getByLatLong/"+latitude+"/"+longitude;
 // form.action = "/";
 // document.body.appendChild(form);
 // form.submit();
}

function onError(error){
    console.log(error)
}
