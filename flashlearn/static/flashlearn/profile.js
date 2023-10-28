document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#profile-image-button")
    .addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelector("#background-form-fields")
        .removeAttribute("hidden");
    });
  document
    .querySelector("#hide-profile-selection")
    .addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector("#remove-background-checkbox").checked = false;
      document.querySelector("#image-upload").value = "";
      document
        .querySelector("#background-form-fields")
        .setAttribute("hidden", true);
    });
});
