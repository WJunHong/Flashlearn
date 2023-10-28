document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 576) {
    if (document.querySelector(".friends-tab")) {
      fetch("friends/pending")
        .then((res) => res.json())
        .then((res) => {
          if (res["count"] == 0) {
            document.querySelector(".invite-count").classList.add("d-none");
          } else {
            document.querySelector(".invite-count").textContent = res["count"];
          }
        });
    }
  } else {
    if (document.querySelector(".friends-tab-mobile")) {
      fetch("friends/pending")
        .then((res) => res.json())
        .then((res) => {
          if (res["count"] == 0) {
            document
              .querySelector(".invite-count-mobile")
              .classList.add("d-none");
          } else {
            document.querySelector(".invite-count-mobile").textContent =
              res["count"];
          }
        });
    }
  }
});
