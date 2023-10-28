let cardCount = 1;
document.addEventListener("DOMContentLoaded", () => {
  addCardBtn = document.querySelector("#add-btn");
  addCardBtn.addEventListener("click", (e) => {
    let count = cardCount;
    e.preventDefault();
    let newCard = document.createElement("div");
    let cardTab = document.querySelector("#cards-div");
    newCard.innerHTML = `<div class="card mt-2 card-container">
    <div class="card-body">
      <div class="form-group">
        <label for="question-${count}">Question:</label>
        <input type="text" class="form-control shadow-none" id="question-${count}" autocomplete="off" value="Who dares wins" name="question-${count}" required>
      </div>
      <div class="form-group">
        <label for="hint-${count}">Hint:</label>
        <input type="text" class="form-control shadow-none" id="hint-${count}" autocomplete="off" value="Who dares wins" name="hint-${count}">
      </div>
      <div class="form-group">
        <label for="answer-${count}">Answer:</label>
        <input type="text" class="form-control shadow-none" id="answer-${count}" autocomplete="off" value="Who dares wins" name="answer-${count}" required>
      </div>
      <div class="form-group">
        <label for="answer-${count}">Difficulty:</label>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="edit-diff-${count}" id="edit-diff-easy-${count}">
          <label class="form-check-label" for="edit-diff-easy-${count}">
            Easy
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="edit-diff-${count}" id="edit-diff-med-${count}" >
          <label class="form-check-label" for="edit-diff-med-${count}">
            Medium
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="edit-diff-${count}" id="edit-diff-hard-${count}" >
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
        <input type="text" name="use${count}", value="T" hidden readonly>
            </div>
            <div class="d-none cover-cancel" id="cover${count}"><button class="btn btn-secondary" id="undo${count}">Undo</button></div>

  </div>`;
    cardTab.appendChild(newCard);
    document.querySelector(`#remove${count}`).addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(`#cover${count}`).classList.remove("d-none");
      document.querySelector(`use${count}`).value = "F";
    });
    document.querySelector(`#undo${count}`).addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(`#cover${count}`).classList.add("d-none");
      document.querySelector(`use${count}`).value = "T";
    });
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
    cardCount++;
  });
  document.querySelector(`#remove1`).addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(`#cover1`).classList.remove("d-none");
  });
  document.querySelector(`#undo1`).addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(`#cover1`).classList.add("d-none");
  });
  document.querySelector("#start-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#game-details").classList.toggle("d-none");
    document.querySelector(".flipme").classList.toggle("turn");
  });
});
