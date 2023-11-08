var page = 1;
var searchPage = 1;
var fsPage = 1;

var lastFetched = 0;

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
    document.querySelector("#search-bar").scrollIntoView();
  });

  sort_options_list = [
    document.querySelector("#sort-time"),
    document.querySelector("#sort-name"),
    document.querySelector("#sort-difficulty"),
    document.querySelector("#sort-likes"),
  ];
  sort_options_list_mobile = [
    document.querySelector("#sort-time-mobile"),
    document.querySelector("#sort-name-mobile"),
    document.querySelector("#sort-difficulty-mobile"),
    document.querySelector("#sort-likes-mobile"),
  ];
  for (let i = 0; i < 4; i++) {
    sort_options_list[i].addEventListener("change", (e) => {
      if (e.target.checked) {
        console.log("here");
        sort_options_list_mobile[i].checked = true;
        for (let j = 0; j < 4; j++) {
          if (j != i) {
            sort_options_list[j].checked = false;
            sort_options_list_mobile[i].checked = false;
          }
        }
      }
    });
  }
  for (let i = 0; i < 4; i++) {
    sort_options_list_mobile[i].addEventListener("change", (e) => {
      if (e.target.checked) {
        sort_options_list[i].checked = true;
        for (let j = 0; j < 4; j++) {
          if (j != i) {
            sort_options_list[j].checked = false;
            sort_options_list_mobile[i].checked = false;
          }
        }
      }
    });
  }

  const fsEvent = (e) => {
    e.preventDefault();
    let body = {};
    if (lastQuery.length > 0) {
      // Read in last used query string
      body.queryString = lastQuery;
    }
    // Read all fs inputs
    if (window.innerWidth > 576) {
      let filterCat = document.querySelector("#filter-cat").value;
      let filterTime = document.querySelector("#filter-time").value;
      let sortType = document.querySelector(
        'input[name="sort-web"]:checked'
      )?.value;
      let sortDirection = document.querySelector(
        'input[name="order-web"]:checked'
      ).value;
      body.cat = filterCat;
      body.time = filterTime;
      body.sort = sortType;
      body.direction = sortDirection;
    } else {
      let filterCat = document.querySelector("#filter-cat-mobile").value;
      let filterTime = document.querySelector("#filter-time-mobile").value;
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
    lastFs = body;
    fetch(`/fs/${fsPage}`, {
      method: "POST",
      mode: "same-origin",
      headers: { "X-CSRFToken": csrftoken },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((res) => {
        listPacks(res.packs, true);
        if (res.more) {
          showMore("fs");
        }
      });
  };

  function filterSort() {
    if (document.querySelector("#pack-container").hasChildNodes()) {
      fsBtn.classList.remove("d-none");
      document
        .querySelector(".fs-submitter")
        .addEventListener("click", fsEvent);
    } else {
      fsBtn.classList.add("d-none");
    }
  }

  function listPacks(packs, clear) {
    if (clear) {
      packContainer.innerHTML = "";
      document.querySelector(".btn-search-loadM")?.remove();
      document.querySelector(".btn-search-loadL")?.remove();
      document.querySelector(".btn-fs-loadM")?.remove();
      document.querySelector(".btn-fs-loadL")?.remove();
      document.querySelector(".btn-index-loadM")?.remove();
      document.querySelector(".btn-index-loadL")?.remove();
    }
    packs.forEach((pack) => {
      packContainer.innerHTML += `<div class="card shadow-sm something" style="width: 12rem">
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
        <a href="pack/${pack.id}" class="stretched-link"></a>
      </div>
      <div class="card-footer text-muted">
      ${pack.like_count} likes <br>
      Difficulty level: ${pack.avg_difficulty}
    </div>
    </div>`;
    });
  }

  function showMore(pageType) {
    let loadMoreBtn = document.createElement("button");
    loadMoreBtn.classList.add(
      "btn",
      "btn-outline-primary",
      `btn-${pageType}-loadM`
    );
    loadMoreBtn.setAttribute("id", "show-more-btn");
    loadMoreBtn.textContent = "Show more...";
    let loadLessBtn = document.createElement("button");
    loadLessBtn.classList.add(
      "btn",
      "btn-outline-success",
      "d-none",
      `btn-${pageType}-loadL`
    );
    loadLessBtn.setAttribute("id", "show-less-btn");
    loadLessBtn.textContent = "Show less...";
    document.querySelector("#buttons-container").appendChild(loadMoreBtn);
    document.querySelector("#buttons-container").appendChild(loadLessBtn);
    topBtn.classList.add("d-none");
    loadLessBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (pageType == "index") {
        page--;
        if (page < 2) {
          topBtn.classList.add("d-none");
          loadLessBtn.classList.add("d-none");
        }
      } else if (pageType == "search") {
        searchPage--;
        if (searchPage < 2) {
          topBtn.classList.add("d-none");
          loadLessBtn.classList.add("d-none");
        }
      } else if (pageType == "fs") {
        fsPage--;
        if (fsPage < 2) {
          topBtn.classList.add("d-none");
          loadLessBtn.classList.add("d-none");
        }
      }
      loadMoreBtn.classList.remove("d-none");
      for (let i = 0; i < lastFetched; i++) {
        packContainer.removeChild(packContainer.lastChild);
      }
    });

    loadMoreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (pageType == "index") {
        page++;
        fetch(`/${[pageType]}/${page}`)
          .then((res) => res.json())
          .then((res) => {
            listPacks(res.packs, false);
            lastFetched = res.packs.length;
            if (!res.more) {
              loadMoreBtn.classList.add("d-none");
            }
          });
      } else if (pageType == "search") {
        searchPage++;
        fetch(`/${[pageType]}/${searchPage}`, {
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
            lastFetched = res.packs.length;
            if (!res.more) {
              loadMoreBtn.classList.add("d-none");
            }
          });
      } else if (pageType == "fs") {
        fsPage++;
        fetch(`/${[pageType]}/${fsPage}`, {
          method: "POST",
          mode: "same-origin",
          headers: { "X-CSRFToken": csrftoken },
          body: JSON.stringify(lastFs),
        })
          .then((res) => res.json())
          .then((res) => {
            listPacks(res.packs, false);
            lastFetched = res.packs.length;
            if (!res.more) {
              loadMoreBtn.classList.add("d-none");
            }
          });
      }
      loadLessBtn.classList.remove("d-none");
      topBtn.classList.remove("d-none");
    });
  }

  function displayRes(res, pageType) {
    listPacks(res.packs, true);

    if (res.more) {
      showMore(pageType);
    }
    filterSort();
  }
  await fetch(`/index/${page}`)
    .then((res) => res.json())
    .then((res) => {
      displayRes(res, "index");
    })
    .catch((e) => console.err(e));
  // Search feature
  document.querySelector(".search-btn").addEventListener("click", async (e) => {
    e.preventDefault();
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
