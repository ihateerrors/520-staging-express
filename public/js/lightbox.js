const showBtn = document.getElementById("showDialog");
const closeBtn = document.getElementById("close-btn");
const lightBox = document.getElementById("light-box");

// "Show the dialog" button opens the <dialog> modally
showBtn.addEventListener("click", () => {
    // showModal makes the dialog element visible and adds syntatic meaning 
    lightBox.showModal();
  });

  closeBtn.addEventListener("click", () => {
    lightBox.close();
  });

  lightBox.addEventListener("click", e => {
    const dialogDimensions = lightBox.getBoundingClientRect()
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
        lightBox.close()
    }
  })

