document.addEventListener("DOMContentLoaded", async () => {
  // Always put in when new list item is added
  document.querySelector(".user-descrip").addEventListener("click", (e) => {
    document.querySelector(".navigation-link").click();
  });
});
