document.addEventListener("DOMContentLoaded", () => {
  let cardCount = parseInt(document.querySelector("#card-count-back").value);
  let addCardBtn = document.querySelector("#add-btn");

  function imageUploadAction(count) {
    document
      .querySelector(`#remove-img-${count}`)
      .addEventListener("click", (e) => {
        document.querySelector(`#img-${count}`).value = "";
        document
          .querySelector(`#img-${count}`)
          .setAttribute("disabled", "True");
      });
    document
      .querySelector(`#new-img-${count}`)
      .addEventListener("click", (e) => {
        document.querySelector(`#img-${count}`).removeAttribute("disabled");
      });
  }

  function cardHideAction(count) {
    document.querySelector(`#remove${count}`).addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(`#cover${count}`).classList.remove("d-none");
      document.querySelector(`#use${count}`).value = "F";
    });
    document.querySelector(`#undo${count}`).addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(`#cover${count}`).classList.add("d-none");
      document.querySelector(`#use${count}`).value = "T";
    });
  }

  for (let i = 1; i <= cardCount; i++) {
    imageUploadAction(i);
    cardHideAction(i);
  }

  addCardBtn.addEventListener("click", (e) => {
    let count = cardCount + 1;
    e.preventDefault();
    let newCard = document.createElement("div");
    let cardTab = document.querySelector("#cards-div");
    newCard.innerHTML = `<div class="card mt-2 card-container">
    <div class="card-body">
      <div class="form-group">
        <label for="question-${count}">Question:</label>
        <input type="text" class="form-control shadow-none" id="question-${count}" autocomplete="off" placeholder="Who dares wins" name="question-${count}" required>
      </div>
      <div class="form-group">
        <label for="hint-${count}">Hint (optional):</label>
        <input type="text" class="form-control shadow-none" id="hint-${count}" autocomplete="off" placeholder="Who dares wins" name="hint-${count}">
      </div>
      <div class="form-group">
        <label for="answer-${count}">Answer:</label>
        <input type="text" class="form-control shadow-none" id="answer-${count}" autocomplete="off" placeholder="Who dares wins" name="answer-${count}" required>
      </div>
      <div class="form-group">
        <label for="answer-${count}">Difficulty:</label>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="edit-diff-${count}" id="edit-diff-easy-${count}" checked  value="E">
          <label class="form-check-label" for="edit-diff-easy-${count}">
            Easy
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="edit-diff-${count}" id="edit-diff-med-${count}"  value="M" >
          <label class="form-check-label" for="edit-diff-med-${count}">
            Medium
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="edit-diff-${count}" id="edit-diff-hard-${count}"  value="H">
          <label class="form-check-label" for="edit-diff-hard-${count}">
            Hard
          </label>
        </div>
      </div>
      <div class="form-group">
        <label for="answer-${count}">Supporting Image:</label>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="edit-img-${count}" id="remove-img-${count}" value="True">
          <label class="form-check-label" for="remove-img-${count}">
            Remove image
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="edit-img-${count}" id="new-img-${count}" value="False" checked>
          <label class="form-check-label" for="new-img-${count}">
            Add new image
          </label>
        </div>
        <input type="file" id="img-${count}" accept="image/*" >
      </div>
    </div>
    <div class="card-footer">
      <!-- Prevent default -->
      <button class="btn btn-danger shadow-none mt-2" id="remove${count}">Remove card -</button>
        <input type="text" id="use${count}", value="T" hidden readonly>
            </div>
            <div class="d-none cover-cancel" id="cover${count}"><button class="btn btn-secondary" id="undo${count}">Undo</button></div>

  </div>`;
    cardTab.appendChild(newCard);
    cardHideAction(count);
    imageUploadAction(count);
    cardCount++;
  });

  // Start or cancel start
  document.querySelector("#start-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#game-details").classList.toggle("d-none");
    document.querySelector(".flipme").classList.toggle("turn");
  });

  document.querySelector("#pack-delete-btn").addEventListener("click", (e) => {
    e.preventDefault();
    fetch(`${packId}/delete`, {
      method: "POST",
      mode: "same-origin",
      headers: { "X-CSRFToken": csrftoken },
      body: JSON.stringify({
        confirm: true,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success == null) {
          console.log("successful delete");
        } else {
          console.error("could not delete");
        }
      });
  });
  document.querySelector("#save-edit-btn").addEventListener("click", (e) => {
    e.preventDefault();
    // Editable fields:
    /*
    PACK FIELDS
    edit-pack-name
    edit-cat
    edit-descrip
    edit-privacy
    ALL CARD FIELDS
    question-i
    hint-i
    answer-i
    input[name='edit-diff-i']:checked
    img-i.files[0]
    usei -> ignore if "F"
    */
    let newPackName = document.querySelector("#edit-pack-name").value;
    if (!newPackName) {
      document.querySelector("#edit-pack-name").scrollIntoView();
      alert("Please specify a pack name!");
      return;
    }
    let newCat = document.querySelector("#edit-cat").value;
    let newDescrip = document.querySelector("#edit-descrip").value;
    let newPriv = document.querySelector("#edit-privacy").value;
    let form = new FormData();
    form.append("name", newPackName);
    form.append("cat", newCat);
    form.append("description", newDescrip);
    form.append("privacy", newPriv);
    console.log(cardCount);
    for (let card = 1; card <= cardCount; card++) {
      if (document.querySelector(`#use${card}`).value == "T") {
        let q = document.querySelector(`#question-${card}`).value;
        if (!q) {
          document.querySelector(`#question-${card}`).scrollIntoView();
          alert("Please specify a question!");
          return;
        }
        let h = document.querySelector(`#hint-${card}`).value;
        let a = document.querySelector(`#answer-${card}`).value;
        if (!a) {
          document.querySelector(`#answer-${card}`).scrollIntoView();
          alert("Please specify an answer!");
          return;
        }

        let diff = document.querySelector(
          `input[name='edit-diff-${card}']:checked`
        ).value;
        if (!diff) {
          document
            .querySelector(`#edit-diff-container-${card}`)
            .scrollIntoView();
          alert("Please select a difficulty!");
          return;
        }

        let cardFields = {};
        cardFields["q"] = q;
        cardFields["h"] = h;
        cardFields["a"] = a;
        cardFields["d"] = diff;
        if (
          document.querySelector(`input[name=edit-img-${card}]:checked`)
            .value == "True"
        ) {
          // No longer want an image
          cardFields["i"] = false;
        } else {
          // Want to include new image
          cardFields["i"] = true;
        }
        // If original card
        if (document.querySelector(`#cid${card}`)) {
          cardFields["o"] = parseInt(
            document.querySelector(`#cid${card}`).value
          );
        } else {
          cardFields["o"] = -1;
        }
        form.append(`c${card}`, JSON.stringify(cardFields));
        if (document.querySelector(`#img-${card}`).files.length > 0) {
          let image = document.querySelector(`#img-${card}`).files[0];
          if (image.size / (1024 * 1024) > 50) {
            document.querySelector(`#img-${card}`).scrollIntoView();
            alert("Please limit your file size to 50mb!");
            return;
          }
          form.append(`i${card}`, image);
        }
      } else {
        if (document.querySelector(`#cid${card}`)) {
          let toDelete = document.querySelector(`#cid${card}`).value;
          form.append(`c${card}-`, toDelete);
        }
      }
    }
    form.append("card_count", cardCount);
    fetch(`${packId}/edit`, {
      method: "POST",
      mode: "same-origin",
      headers: { "X-CSRFToken": csrftoken },
      body: form,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          let link = document.createElement("a");
          link.href = ``;
          link.click();
        } else {
          console.log("edit went wrong somewhere...");
        }
      });
  });

  // Favourite button
  document.querySelector("#fav-btn").addEventListener("click", (e) => {
    e.preventDefault();
    if (
      document.querySelector("#fav-btn").textContent.trim() ==
      "Remove from favourites"
    ) {
      fetch(`${packId}/removeFav`, {
        method: "POST",
        mode: "same-origin",
        headers: { "X-CSRFToken": csrftoken },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            document.querySelector("#fav-btn").innerHTML = ` 
          Add to favourites <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="grey" class="bi bi-star-fill" viewBox="0 0 16 18">
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
          </svg>
        `;
          } else {
            console.error("something went wrong for fav!");
          }
        });
    } else if (
      document.querySelector("#fav-btn").textContent.trim() ==
      "Add to favourites"
    ) {
      fetch(`${packId}/addFav`, {
        method: "POST",
        mode: "same-origin",
        headers: { "X-CSRFToken": csrftoken },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            document.querySelector("#fav-btn").innerHTML = `
            Remove from favourites <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="yellow" class="bi bi-star-fill" viewBox="0 0 16 18">
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
          </svg>
       `;
          } else {
            console.error("something went wrong for fav!");
          }
        });
    }
  });
  // Dislike button
  document.querySelector(".dislike-btn").addEventListener("click", (e) => {
    e.preventDefault();
    if (document.querySelector(".dislike-btn").classList.contains("dislike")) {
      fetch(`${packId}/removeDislike`, {
        method: "POST",
        mode: "same-origin",
        headers: { "X-CSRFToken": csrftoken },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            document.querySelector("#like-count").textContent =
              res.new_like_count;
            document.querySelector(".dislike-btn").classList.remove("dislike");
            document.querySelector(".dislike-btn").classList.add("no-dislike");
          } else {
            console.error("dislike error");
          }
        });
    } else if (
      document.querySelector(".dislike-btn").classList.contains("no-dislike")
    ) {
      fetch(`${packId}/addDislike`, {
        method: "POST",
        mode: "same-origin",
        headers: { "X-CSRFToken": csrftoken },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            document.querySelector("#like-count").textContent =
              res.new_like_count;
            document.querySelector(".dislike-btn").classList.add("dislike");
            document
              .querySelector(".dislike-btn")
              .classList.remove("no-dislike");
            document.querySelector(".like-btn").classList.add("no-like");
            document.querySelector(".like-btn").classList.remove("like");
          } else {
            console.error("dislike error");
          }
        });
    }
  });

  // Like button
  document.querySelector(".like-btn").addEventListener("click", (e) => {
    e.preventDefault();
    if (document.querySelector(".like-btn").classList.contains("like")) {
      fetch(`${packId}/removeLike`, {
        method: "POST",
        mode: "same-origin",
        headers: { "X-CSRFToken": csrftoken },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            document.querySelector("#like-count").textContent =
              res.new_like_count;
            document.querySelector(".like-btn").classList.remove("like");
            document.querySelector(".like-btn").classList.add("no-like");
          } else {
            console.error("like error");
          }
        });
    } else if (
      document.querySelector(".like-btn").classList.contains("no-like")
    ) {
      fetch(`${packId}/addLike`, {
        method: "POST",
        mode: "same-origin",
        headers: { "X-CSRFToken": csrftoken },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            document.querySelector("#like-count").textContent =
              res.new_like_count;
            document.querySelector(".like-btn").classList.add("like");
            document.querySelector(".like-btn").classList.remove("no-like");
            document.querySelector(".dislike-btn").classList.add("no-dislike");
            document.querySelector(".dislike-btn").classList.remove("dislike");
          } else {
            console.error("like error");
          }
        });
    }
  });
});
