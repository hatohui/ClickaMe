(async () => {
  const keyCombo = await new Promise((resolve) => {
    chrome.storage.sync.get("start", (data) => {
      resolve(data.start || "ALT+X");
    });
  });

  const keysDown = new Set();

  const handleVisibilityChange = () => {
    if (document.hidden) {
      keysDown.clear();
      removeEventListeners();
      console.log("removed", new Date().toLocaleString());
    } else {
      addNewEventListeners();
      console.log("added", new Date().toLocaleString());
    }
  };

  //handle event listeners
  const addNewEventListeners = () => {
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
  };

  const removeEventListeners = () => {
    document.removeEventListener("keydown", keyDown);
    document.removeEventListener("keyup", keyUp);
  };

  const handleUrlChange = () => {
    console.log("URL changed to:", window.location.href);
    addNewEventListeners();
  };

  const observeUrlChanges = () => {
    let lastUrl = window.location.href;
    new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        handleUrlChange();
      }
    }).observe(document, { subtree: true, childList: true });
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  const keyUp = () => {
    keysDown.clear();
  };

  const keyDown = async (event) => {
    let key = event.key.toUpperCase();
    switch (key) {
      case "CONTROL":
        key = "CTRL";
        break;
      case " ":
        key = "SPACE";
        break;
      default:
    }
    keysDown.add(key);

    console.log(keysDown);

    if (Array.from(keysDown).join("+") === keyCombo) {
      removeEventListeners();
      keysDown.clear();
      startInput();
    }
  };

  //*INITIATE THE VALUES HERE  */

  addNewEventListeners();
  observeUrlChanges();

  //**main functions */
  const startInput = () => {
    const input = createInput();
    const locations = findAllClickablePlaces();
    handleInput(input, locations);
  };

  const createInput = () => {
    const input = document.createElement("input");
    input.id = "cl1ckAmE-boARd";
    input.type = "text";
    input.placeholder = "Enter text here...";
    input.style.position = "fixed";
    input.style.bottom = "20px";
    input.style.right = "20px";
    input.style.color = "#000";
    input.style.backgroundColor = "#fff";
    input.style.padding = "10px";
    input.style.border = "1px solid #007bff";
    input.style.borderRadius = "8px";
    input.style.zIndex = "100000";
    input.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    input.style.pointerEvents = "auto";
    input.style.fontFamily = "Arial, sans-serif";
    input.style.fontSize = "14px";
    document.body.appendChild(input);
    return input;
  };

  const findAllClickablePlaces = () => {
    const clickableElements = document.querySelectorAll(
      `
    [tabindex]:not([tabindex="-1"]), 
    [role="button"], 
    [role="menuitem"], 
    [role="option"], 
    [role="slider"], 
    [role="checkbox"], 
    [role="tab"], 
    [role="link"], 
    [role="switch"], 
    [role="radio"], 
    [role="treeitem"], 
    [role="gridcell"], 
    [role="cell"], 
    a[href], 
    button, 
    input:not([type="hidden"]), 
    textarea, 
    select, 
    summary, 
    details, 
    iframe, 
    embed, 
    object, 
    area[href], 
    audio[controls], 
    video[controls]
    `
    );

    const generateRandomLetters = (existingLetters) => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let randomLetters;
      do {
        randomLetters = Array.from(
          { length: 3 },
          () => letters[Math.floor(Math.random() * letters.length)]
        ).join("");
      } while (existingLetters.has(randomLetters));
      existingLetters.add(randomLetters);
      return randomLetters;
    };

    const isElementInViewport = (el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    };

    const existingLetters = new Set();
    const infoBubbles = [];
    const elementLocations = new Map();

    clickableElements.forEach((element) => {
      if (element.id !== "cl1ckAmE-boARd" && isElementInViewport(element)) {
        const infoBubble = document.createElement("span");
        const randomLetters = generateRandomLetters(existingLetters);
        infoBubble.textContent = randomLetters;
        infoBubble.style.position = "absolute";
        infoBubble.style.backgroundColor = "#007bff";
        infoBubble.style.color = "#fff";
        // infoBubble.style.padding = "1px 3px";
        infoBubble.style.borderRadius = "3px";
        infoBubble.style.fontSize = "9px"; // Smaller font size
        infoBubble.style.fontFamily = "Arial, sans-serif";
        infoBubble.style.zIndex = "100001";
        infoBubble.style.pointerEvents = "none";
        infoBubble.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";

        const rect = element.getBoundingClientRect();
        infoBubble.style.top = `${rect.top + window.scrollY}px`;
        infoBubble.style.left = `${rect.left + window.scrollX}px`;

        document.body.appendChild(infoBubble);
        infoBubbles.push(infoBubble);

        elementLocations.set(randomLetters, {
          element,
          bubble: infoBubble,
          rect,
        });
      }
    });

    const removeInfoBubbles = () => {
      infoBubbles.forEach((bubble) => bubble.remove());
    };

    window.addEventListener("scroll", removeInfoBubbles, {
      once: true,
    });
    return elementLocations;
  };

  const cleanUpInput = (input, locations) => {
    input.removeEventListener("keydown", handleInputListener);
    locations.forEach(({ bubble }) => {
      bubble.remove();
    });
    input.remove();
    addNewEventListeners();
  };

  const handleInputListener = (event, input, locations) => {
    if (event.key === "Enter" || event.key === "Escape") {
      cleanUpInput(input, locations);
    }

    if (!/^[a-zA-Z]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    const letters = input.value.toUpperCase() + event.key.toUpperCase();

    for (const key of locations.keys()) {
      if (!key.startsWith(letters)) {
        const { bubble } = locations.get(key);
        bubble.remove();
        locations.delete(key);
      }
    }

    const keys = Array.from(locations.keys()).filter((key) =>
      key.includes(letters)
    );

    if (keys.length === 1) {
      const location = locations.get(keys[0]);
      if (location) {
        const { element } = location;
        console.log(element);

        element.focus();
        element.click();

        cleanUpInput(input, locations);
      }
    }
  };

  const handleInput = (input, locations) => {
    input.focus();
    input.addEventListener("keydown", (event) =>
      handleInputListener(event, input, locations)
    );
  };
})();
