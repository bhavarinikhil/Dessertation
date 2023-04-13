
inputField.addEventListener("keyup", e => {

    if (e.key == "Enter" && inputField.value != "") {
        //requestApi(inputField.value);
    }
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {

    } else {
        alert("Your browser not support geolocation api");
    }
});
