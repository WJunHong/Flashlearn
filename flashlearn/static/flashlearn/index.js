document.addEventListener("DOMContentLoaded", () => {
  fsBtn = document.querySelector("#filter-button");
  fsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.innerWidth > 576) {
      document.querySelector("#web-fs-view").classList.toggle("d-none");
    } else {
      document.querySelector("#mobile-fs-view").classList.toggle("d-none");
    }
  });
});
