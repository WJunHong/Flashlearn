document.addEventListener("DOMContentLoaded", () => {
  // Only for initial load
  fetch("badge")
    .then((res) => res.json())
    .then((res) => {
      if (res["count"] > 0) {
        document.querySelector(
          ".friends-tab"
        ).innerHTML += `<span class="badge badge-danger ml-1 invite-count"
        >${res["count"]}</span
      >`;
        document.querySelector(
          ".friends-tab-mobile"
        ).innerHTML += `<span class="badge badge-danger ml-1 invite-count"
        >${res["count"]}</span
      >`;
      }
    });
});
