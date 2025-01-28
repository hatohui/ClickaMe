const startSettingButton = document.getElementById("start");
const startSettingInput = document.getElementById("startInput");
const startSettingInfo = document.getElementById("startInfo");

chrome.storage.sync.get("start", (result) => {
  if (result.start) {
    startSettingInput.value = result.start;
  }
});

startSettingButton.addEventListener("click", async () => {
  startSettingInput.setAttribute("readonly", false);
  startSettingInput.setAttribute("placeholder", "");
  startSettingInput.value = "";
  startSettingInput.focus();
  startSettingInfo.style.display = "block";
  startSettingInfo.innerText = "Please input your keys";

  await new Promise((resolve) => {
    const inputKeys = new Set();

    const keydown = (event) => {
      event.preventDefault();
      let key = event.key.toUpperCase();
      switch (key) {
        case "CONTROL":
          inputKeys.add("CTRL");
          break;
        case " ":
          inputKeys.add("SPACE");
          break;
        default:
          inputKeys.add(key);
      }
      startSettingInput.value = Array.from(inputKeys).join("+");
    };

    const keyup = () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
      chrome.storage.sync.set(
        { start: Array.from(inputKeys).join("+") },
        () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving input:", chrome.runtime.lastError);
            startSettingInfo.innerText = "Error saving input";
          } else {
            startSettingInfo.innerText = "Input saved successfully";
          }
          resolve();
        }
      );
    };

    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
  });

  startSettingInput.setAttribute("readonly", true);
  setTimeout(() => {
    startSettingInfo.style.display = "none";
  }, 3000);
});
