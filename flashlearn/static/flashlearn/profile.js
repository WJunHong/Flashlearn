document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#profile-image-button")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelector("#background-form-fields")
        .removeAttribute("hidden");
    });
  document
    .querySelector("#remove-background-checkbox")
    ?.addEventListener("change", (e) => {
      if (e.currentTarget.checked) {
        document.querySelector("#image-upload").setAttribute("disabled", true);
        document.querySelector("#remove-background-checkbox").value = "T";
        document.querySelector("#image-upload").value = "";
      } else {
        document.querySelector("#image-upload").removeAttribute("disabled");
        document.querySelector("#remove-background-checkbox").value = "F";
      }
    });
  document
    .querySelector("#hide-profile-selection")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector("#remove-background-checkbox").checked = false;
      document.querySelector("#remove-background-checkbox").value = "F";
      document.querySelector("#image-upload").value = "";
      document
        .querySelector("#background-form-fields")
        .setAttribute("hidden", true);
    });

  let userId = document.querySelector("#user-id").value;
  let otherUserId = document.querySelector("#my-user-id")?.value;
  let packsBody = document.querySelector("#profile-packs");

  function fetchPacks(operation) {
    fetch(`${userId}/${operation}`, {
      method: "POST",
      mode: "same-origin",
      headers: { "X-CSRFToken": csrftoken },
    })
      .then((res) => res.json())
      .then((res) => {
        let packs = res.packs;
        packsBody.innerHTML = "";
        packs.forEach((pack) => {
          packsBody.innerHTML += `<div class="card shadow-sm something" style="width: 12rem">
          <div class="card-body">
            <h5 class="card-title">${pack.name}</h5>
            <p class="badge badge-success">#${pack.id}</p>
            <h6 class="card-subtitle mb-2 text-muted">${pack.creator}</h6><br>
            ${
              pack.category
                ? `<span class="badge badge-info">${pack.category}</span>`
                : ""
            }
           
            <p class="card-text">
              ${
                pack.description
                  ? pack.description
                  : "This pack has no description, click to find out more!"
              }
            </p>
            <a href="pack/pack/${pack.id}" class="stretched-link"></a>
          </div>
          <div class="card-footer text-muted">
          ${pack.like_count} likes <br>
          Difficulty level: ${pack.avg_difficulty}
        </div>
        </div>`;
        });
      });
  }
  fetchPacks("all");
  document.querySelector("#packs-button").addEventListener("click", (e) => {
    e.preventDefault();
    fetchPacks("all");
  });
  document.querySelector("#likes-button").addEventListener("click", (e) => {
    e.preventDefault();
    fetchPacks("likes");
  });
  document.querySelector("#fav-button")?.addEventListener("click", (e) => {
    e.preventDefault();
    fetchPacks("favs");
  });
  document.querySelector("#profile-submit")?.addEventListener("click", (e) => {
    e.preventDefault();
    let checked = document.querySelector("#remove-background-checkbox").value;
    let image = document.querySelector("#image-upload").files[0];
    if (!image && checked == "F") {
      return;
    }
    if (checked == "T") {
      image = null;
    }
    let form = new FormData();
    form.append("image", image);
    fetch(`${userId}/image`, {
      method: "POST",
      mode: "same-origin",
      headers: { "X-CSRFToken": csrftoken },
      body: form,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.successful) {
          console.log("successful update");
          if (res.user.image) {
            document.querySelector("#profile-image").src = res.user.image;
          } else {
            document.querySelector("#profile-image").src =
              "/static/flashlearn/default_profile.jpg";
          }
        } else {
          console.error("something went wrong");
        }
      });
  });
});
