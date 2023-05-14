
async function registerWebPush() {


    const register = await navigator.serviceWorker.register('../service-worker.js', {
        scope: '/'
    });
    let payload = {
        userVisibleOnly: true,
        applicationServerKey: "BH3b2DZ7U5qy9lnkTDtCFZ9shehFOU3FWhCYml2gQHOn3p57ZEdOeIjOEcxLWZaikm0r2-WSMUODOWedq0ZR_dU",
    }
    const pushSubscription = await register.pushManager.subscribe(payload);
    console.log(pushSubscription.endpoint);
    await fetch("/register", {
        method: "POST",
        body: JSON.stringify(pushSubscription),
        headers: {
            "Content-Type": "application/json",
        }
    })
}


registerWebPush() 