let cardCount = 0;
document.addEventListener("DOMContentLoaded", () => {
  let addCardBtn = document.querySelector("#add-btn");
  let submitBtn = document.querySelector("#submit-btn");

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

  addCardBtn.addEventListener("click", (e) => {
    let count = cardCount + 1;
    e.preventDefault();
    let newCard = document.createElement("div");
    let cardTab = document.querySelector("#tabCards");
    newCard.innerHTML = `<div class="border p-3 rounded shadow-sm mt-3 new-card">
          <div class="alert alert-danger d-none mt-3" id="alert-card${count}">
          
          Please provide a question and answer! 
        </div>
        <div>
        <label for="Q${count}" >Question</label>
        <input type="text" class="form-control shadow-none mb-3" id="Q${count}" placeholder="E.g. What is the atomic mass of carbon?" name="Q${count}" required autocomplete="off">
        
        <label for="H${count}" >Hint (optional):</label>
        <input type="text" class="form-control shadow-none mb-3" id="H${count}" name="H${count}" autocomplete="off">
        <div class="mb-3">
        <label>Difficulty:</label><br>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="DF${count}" id="DE_${count}" value="E" checked>
            <label class="form-check-label" for="DE_${count}">Easy</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="DF${count}" id="DM_${count}" value="M">
            <label class="form-check-label" for="DM_${count}">Medium</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="DF${count}" id="DH_${count}" value="H">
            <label class="form-check-label" for="DH_${count}">Hard</label>
          </div>
        </div>
        <label for="A${count}" >Answer:</label>
        <input type="text" class="form-control shadow-none mb-3" id="A${count}" name="A${count}" autocomplete="off" placeholder="E.g. 14">
        <div class="mb-3">
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

        <button class="btn btn-danger shadow-none mt-2" id="remove${count}">Remove card -</button>
        <input type="text" id="use${count}", value="T" hidden readonly class="usable">
            </div>
            <div class="d-none cover-cancel" id="cover${count}"><button class="btn btn-secondary" id="undo${count}">Undo</button></div>
        </div>`;
    cardTab.appendChild(newCard);
    imageUploadAction(count);
    cardHideAction(count);
    cardCount++;
  });
  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // Validation / checking before submitting
    let name = document.querySelector("#packName").value;
    if (name.length == 0) {
      document.querySelector("#name-tab").click();
      document.querySelector("#alert-name").classList.remove("d-none");
    } else {
      document.querySelector("#alert-name").classList.add("d-none");
      let cardList = Array.from(document.querySelectorAll(".new-card"));
      let cards = cardList.filter((x) => {
        return x.querySelector(".usable").value == "T";
      });
      if (cards.length == 0) {
        document.querySelector("#cards-tab").click();
        document.querySelector("#alert-cards").classList.remove("d-none");
        return;
      } else {
        document.querySelector("#alert-cards").classList.add("d-none");
        let description = document.querySelector("#packDescription").value;
        let cat = document.querySelector("#packCat").value;
        let privacy = document.querySelector(
          "input[name='privacy']:checked"
        ).value;
        let form = new FormData();
        form.append("name", name);
        form.append("description", description);
        form.append("categories", cat);
        form.append("privacy", privacy);
        form.append("count", cardCount);
        let doNotSubmit = false;
        for (let i = 1; i <= cardList.length; i++) {
          if (cardList[i - 1].querySelector(".usable").value == "T") {
            if (
              cardList[i - 1].querySelector(`#Q${i}`).value == "" ||
              cardList[i - 1].querySelector(`#A${i}`).value == ""
            ) {
              document.querySelector("#cards-tab").click();
              cardList[i - 1].scrollIntoView();
              cardList[i - 1]
                .querySelector(`#alert-card${i}`)
                .classList.remove("d-none");
              doNotSubmit = true;
              continue;
            } else {
              cardList[i - 1]
                .querySelector(`#alert-card${i}`)
                .classList.add("d-none");
            }
            let entry = {
              question: document.querySelector(`#Q${i}`).value,
              answer: document.querySelector(`#A${i}`).value,
              hint: document.querySelector(`#H${i}`).value,
              difficulty: document.querySelector(`input[name='DF${i}']:checked`)
                .value,
            };

            if (document.querySelector(`#img-${i}`).files.length > 0) {
              let image = document.querySelector(`#img-${i}`).files[0];
              if (image.size / (1024 * 1024) > 50) {
                document.querySelector(`#img-${i}`).scrollIntoView();
                alert("Please limit your file size to 50mb!");
                return;
              }
              form.append(`i${i}`, image);
            }
            form.append(`c${i}`, JSON.stringify(entry));
          }
        }
        if (doNotSubmit) {
          return;
        }
        fetch("", {
          method: "POST",
          mode: "same-origin",
          headers: { "X-CSRFToken": csrftoken },
          body: form,
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              let link = document.createElement("a");
              link.href = `pack/${res.packId}`;
              link.click();
            }
            if (res.error) {
              console.log(res.error);
            }
          });
      }
    }
  });
});
