window.addEventListener("beforeinstallprompt", (e) => {
    // log the platforms provided as options in an install prompt
    console.log(e.platforms); // e.g., ["web", "android", "windows"]
    e.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome); // either "accepted" or "dismissed"
    }, handleError);
  });