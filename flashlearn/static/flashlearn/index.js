var page = 1;
var searchPage = 1;
var fsPage = 1;

document.addEventListener("DOMContentLoaded", async () => {
  let fsBtn = document.querySelector("#filter-button");
  let cancelMobileBtn = document.querySelector("#cancel-mobile-btn");
  let cancelWebBtn = document.querySelector("#cancel-web-btn");
  let topBtn = document.querySelector("#back-to-top-btn");
  let packContainer = document.querySelector("#pack-container");
  let lastQuery = "";
  let lastFs = {};
  fsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.innerWidth > 576) {
      document.querySelector("#web-fs-view").classList.toggle("d-none");
    } else {
      document.querySelector("#mobile-fs-view").classList.toggle("d-none");
    }
  });
  cancelMobileBtn.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#mobile-fs-view").classList.toggle("d-none");
  });
  cancelWebBtn.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#web-fs-view").classList.toggle("d-none");
  });
  topBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location = "#dummy-navigation";
  });

  function filterSort(fromQueryString) {
    if (document.querySelector("#pack-container").hasChildNodes()) {
      fsBtn.classList.remove("d-none");
      document.querySelector(".fs-submitter").addEventListener("click", (e) => {
        e.preventDefault();
        let body = {};
        if (fromQueryString) {
          // Read in last used query string
          if (lastQuery.length > 0) {
            body.queryString = lastQuery;
          }
        } else {
          // Read all fs inputs
          if (window.innerWidth > 576) {
            let filterCat = document.querySelector("#filter-cat").value;
            let filterTime = document.querySelector("#filter-time").value;
            let sortType = document.querySelector(
              'input[name="sort-web"]:checked'
            ).value;
            let sortDirection = document.querySelector(
              'input[name="order-web"]:checked'
            ).value;
            body.cat = filterCat;
            body.time = filterTime;
            body.sort = sortType;
            body.direction = sortDirection;
          } else {
            let filterCat = document.querySelector("#filter-cat-mobile").value;
            let filterTime = document.querySelector(
              "#filter-time-mobile"
            ).value;
            let sortType = document.querySelector(
              'input[name="sort-mobile"]:checked'
            ).value;
            let sortDirection = document.querySelector(
              'input[name="order-mobile"]:checked'
            ).value;
            body.cat = filterCat;
            body.time = filterTime;
            body.sort = sortType;
            body.direction = sortDirection;
          }
        }
        lastFs = body;
        fetch(`/fs/${fsPage}`, {
          method: "POST",
          mode: "same-origin",
          headers: { "X-CSRFToken": csrftoken },
          body: JSON.stringify(body),
        })
          .then((res) => res.json())
          .then((res) => {
            listPacks(res, true);
            if (res.more) {
              showMore("fs");
            }
          });
      });
    }
  }

  function listPacks(packs, clear) {
    if (clear) {
      packContainer.innerHTML = "";
    }
    packs.forEach((pack) => {
      packContainer.innerHTML += `<div class="card shadow-sm something" style="width: 12rem">
      <div class="card-body">
        <h5 class="card-title">${pack.name}<span class="badge badge-success">#${pack.id}</span></h5>
        <h6 class="card-subtitle mb-2 text-muted">${pack.creator}</h6><br>
        {% if ${pack.category} %}
        <span class="badge badge-info">${pack.category}</span>
        {% endif %}
        <p class="card-text">
          {% if ${pack.description} %}
            Some quick example text to build on the card title and make up the bulk
            of the card's content.
          {% else %}
            This pack has no description, click to find out more!
          {% endif %}
        </p>
        <a href="#" class="stretched-link"></a>
      </div>
      <div class="card-footer text-muted">
      ${pack.like_count} likes <br>
      ${pack.avg_difficulty} difficulty
    </div>
    </div>`;
    });
  }

  function showMore(pageType) {
    let loadMoreBtn = document.createElement("button");
    loadMoreBtn.classList.add("btn", "btn-outline-primary");
    loadMoreBtn.setAttribute("id", "show-more-btn");
    loadMoreBtn.textContent = "Show more...";
    packContainer.after(loadMoreBtn);
    loadMoreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (loadMoreBtn.textContent == "Show less...") {
        if (pageType == "index") {
          page--;
          if (page < 2) {
            topBtn.classList.add("d-none");
          }
        } else if (pageType == "search") {
          searchPage--;
          if (searchPage < 2) {
            topBtn.classList.add("d-none");
          }
        } else if (pageType == "fs") {
          fsPage--;
          if (fsPage < 2) {
            topBtn.classList.add("d-none");
          }
        }
        for (let i = 0; i < 10; i++) {
          packContainer.removeChild(packContainer.lastChild);
        }
      }
      if (pageType == "index") {
        page++;
        fetch(`/${[pageType]}/${page}`)
          .then((res) => res.json())
          .then((res) => {
            listPacks(res.packs, false);
            if (!res.more) {
              loadMoreBtn.textContent = "Show less...";
            }
          });
      } else if (pageType == "search") {
        searchPage++;
        fetch(`/${[pageType]}/${page}`, {
          method: "POST",
          mode: "same-origin",
          headers: { "X-CSRFToken": csrftoken },
          body: JSON.stringify({
            queryString: lastQuery,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            listPacks(res.packs, false);
            if (!res.more) {
              loadMoreBtn.textContent = "Show less...";
            }
          });
      } else if (pageType == "fs") {
        fsPage++;
        fetch(`/${[pageType]}/${page}`, {
          method: "POST",
          mode: "same-origin",
          headers: { "X-CSRFToken": csrftoken },
          body: JSON.stringify(lastFs),
        })
          .then((res) => res.json())
          .then((res) => {
            listPacks(res.packs, false);
            if (!res.more) {
              loadMoreBtn.textContent = "Show less...";
            }
          });
      }

      if (pageType == "index") {
        if (page > 1) {
          topBtn.classList.remove("d-none");
        }
      } else if (pageType == "search") {
        if (searchPage > 1) {
          topBtn.classList.remove("d-none");
        }
      } else if (pageType == "fs") {
        if (fsPage > 1) {
          topBtn.classList.remove("d-none");
        }
      }
    });
  }

  function displayRes(res, pageType) {
    listPacks(res.packs, true);
    if (res.more) {
      showMore(pageType);
    }
    filterSort(pageType == "search");
  }
  await fetch(`/index/${page}`)
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      displayRes(res, "index");
    })
    .catch((e) => console.err(e));
  // Search feature
  document.querySelector(".search-btn").addEventListener("click", async (e) => {
    let queryString = document.querySelector("#search-bar").value;
    lastQuery = queryString;
    if (queryString.length == 0) {
      return;
    }
    // Protect search with CSRF token
    await fetch(`/search/${searchPage}`, {
      method: "POST",
      mode: "same-origin",
      headers: { "X-CSRFToken": csrftoken },
      body: JSON.stringify({
        queryString: queryString,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        displayRes(res, "search");
      });
  });
});
