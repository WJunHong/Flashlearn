let searchPage = 1;
let sentPage = 1;
let requestsPage = 1;
let friendsPage = 1;

let searchLoadedCount = 0;
let sentLoadedCount = 0;
let requestsLoadedCount = 0;
let friendsLoadedCount = 0;

let lastSearch = "";

const searchPrefix = "search-";

document.addEventListener("DOMContentLoaded", async () => {
  // Containers
  let sentContainer = document.querySelector("#sent-requests");
  let requestsContainer = document.querySelector("#pending-requests");
  let friendsContainer = document.querySelector("#friends-list");
  let searchContainer = document.querySelector("#search-results");

  // List items
  function sentItem(friend) {
    return ` 
    <div class="friend-list-item" id="sent-${friend.userId}">      
    <div class="sent-user-descrip-${friend.userId} user-descrip">
      <img class="profile-image" src=${
        friend.image ? friend.image : "/static/flashlearn/default_profile.jpg"
      }/>
      <div>
        <p class="profile-name">${friend.name}</p>
        <span class="badge badge-success profile-id">#${friend.userId}</span>
      </div>
      <a href="/profile/${friend.userId}" class="sent-navigation-link-${
      friend.userId
    }"></a>
    </div>

    <form action="" method="post" class="list-actions">

      ${removeSentBtn(friend)}
    </form>
  </div>`;
  }
  function requestItem(friend) {
    return ` <div class="friend-list-item" id="request-${friend.userId}">      
    <div class="requests-user-descrip-${friend.userId} user-descrip">
      <img class="profile-image" src=${
        friend.image ? friend.image : "/static/flashlearn/default_profile.jpg"
      }/>
      <div>
      <p class="profile-name">${friend.name}</p>
      <span class="badge badge-success profile-id">#${friend.userId}</span>
      </div>
      <a href="/profile/${friend.userId}"" class="requests-navigation-link-${
      friend.userId
    }"></a>
    </div>

    <form action="" method="post" class="list-actions">

      ${acceptBtn(friend)}
      ${rejectBtn(friend)}
    </form>
  </div>`;
  }
  function friendItem(friend) {
    return ` <div class="friend-list-item" id="friend-${friend.userId}">
      
    <div class="all-user-descrip-${friend.userId} user-descrip">
      <img class="profile-image" src=${
        friend.image ? friend.image : "/static/flashlearn/default_profile.jpg"
      }/>
      <div>
      <p class="profile-name">${friend.name}</p>
      <span class="badge badge-success profile-id">#${friend.userId}</span>
      </div>
      <a href="/profile/${friend.userId}"" class="all-navigation-link-${
      friend.userId
    }"></a>
    </div>

    <form action="" method="post" class="list-actions">

      ${removeBtn(friend)}
    </form>
  </div>`;
  }

  function removeSentBtn(friend) {
    return `<button class="list-item-btn reject " id="remove-sent-${friend.userId}">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ed0800" class="bi bi-trash" viewBox="0 0 16 16">
<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
</svg>
</button>`;
  }
  function searchRemoveSentBtn(friend) {
    return `<button class="list-item-btn reject d-none" id="search-remove-sent-${friend.userId}">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ed0800" class="bi bi-trash" viewBox="0 0 16 16">
<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
</svg>
</button>`;
  }
  function acceptBtn(friend) {
    return ` <button class="list-item-btn accept" id="accept-request-${friend.userId}">
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  fill="#5adbb5"
  class="bi bi-check"
  viewBox="0 0 17 16"
>
  <path
    d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"
  />
</svg>
</button>`;
  }
  function searchAcceptBtn(friend) {
    return ` <button class="list-item-btn accept d-none" id="search-accept-request-${friend.userId}">
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  fill="#5adbb5"
  class="bi bi-check"
  viewBox="0 0 17 16"
>
  <path
    d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"
  />
</svg>
</button>`;
  }
  function rejectBtn(friend) {
    return `<button class="list-item-btn reject" id="reject-request-${friend.userId}">
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  fill="#ed0800"
  class="bi bi-x"
  viewBox="0 0 16 16"
>
  <path
    d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
  />
</svg>
</button>`;
  }
  function searchRejectBtn(friend) {
    return `<button class="list-item-btn reject d-none" id="search-reject-request-${friend.userId}">
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  fill="#ed0800"
  class="bi bi-x"
  viewBox="0 0 16 16"
>
  <path
    d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
  />
</svg>
</button>`;
  }
  function removeBtn(friend) {
    return ` <button class="list-item-btn reject" id="remove-friend-${friend.userId}">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ed0800" class="bi bi-person-dash" viewBox="0 0 16 16">
    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1Zm0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
    <path d="M8.256 14a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1h5.256Z"/>
  </svg>
</button>
`;
  }
  function searchRemoveBtn(friend) {
    return ` <button class="list-item-btn reject d-none" id="search-remove-friend-${friend.userId}">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ed0800" class="bi bi-person-dash" viewBox="0 0 16 16">
    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1Zm0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
    <path d="M8.256 14a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1h5.256Z"/>
  </svg>
</button>`;
  }

  function inviteBtn(friend) {
    return `<button class="list-item-btn accept" id="invite-${friend.userId}">

    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#5adbb5" class="bi bi-person-fill-add" viewBox="0 0 16 16">
  <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
  <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z"/>
</svg>
  </button>`;
  }
  function searchItem(friend) {
    return ` 
    <div class="friend-list-item" id="search-item-${friend.userId}">      
    <div class="search-user-descrip-${friend.userId} user-descrip">
      <img class="profile-image" src=${
        friend.image ? friend.image : "/static/flashlearn/default_profile.jpg"
      }/>
      <div>
        <p class="profile-name">${friend.name}</p>
        <span class="badge badge-success profile-id">#${friend.userId}</span>
      </div>
      <a href="/profile/${friend.userId}" class="search-navigation-link-${
      friend.userId
    }"></a>
    </div>

    <form action="" method="post" class="list-actions">
      ${inviteBtn(friend)}
      ${searchRemoveSentBtn(friend)}
      ${searchRemoveBtn(friend)}
      ${searchAcceptBtn(friend)}
      ${searchRejectBtn(friend)}
    </form>
  </div>`;
  }

  function removeSentAction(friend) {
    // hide remove button
    document
      .querySelector(`#search-item-${friend.userId}`)
      ?.querySelector(`#search-remove-sent-${friend.userId}`)
      .classList.add("d-none");
    // Show invite btn
    document
      .querySelector(`#search-item-${friend.userId}`)
      ?.querySelector(`#invite-${friend.userId}`)
      .classList.remove("d-none");
  }

  function acceptRequestAction(friend) {
    document
      ?.querySelector(`#search-item-${friend.userId}`)
      ?.querySelector(`#search-accept-request-${friend.userId}`)
      .classList.add("d-none");
    document
      ?.querySelector(`#search-item-${friend.userId}`)
      ?.querySelector(`#search-reject-request-${friend.userId}`)
      .classList.add("d-none");
    document
      ?.querySelector(`#search-item-${friend.userId}`)
      ?.querySelector(`#invite-${friend.userId}`)
      .classList.add("d-none");
    document
      ?.querySelector(`#search-item-${friend.userId}`)
      ?.querySelector(`#search-remove-sent-${friend.userId}`)
      .classList.add("d-none");
    document
      ?.querySelector(`#search-item-${friend.userId}`)
      ?.querySelector(`#search-remove-friend-${friend.userId}`)
      .classList.remove("d-none");
  }

  function updateBadge() {
    let badge = document.querySelector(".invite-count");
    console.log(badge);
    if (badge) {
      let count = parseInt(badge.textContent) - 1;
      if (count == 0) {
        document.querySelector(".invite-count").classList.add("d-none");
        document.querySelector(".invite-count-mobile").classList.add("d-none");
      } else {
        document.querySelector(".invite-count").classList.remove("d-none");
        document
          .querySelector(".invite-count-mobile")
          .classList.remove("d-none");
        document.querySelector(".invite-count").textContent =
          parseInt(document.querySelector(".invite-count").textContent) - 1;
        document.querySelector(".invite-count-mobile").textContent =
          parseInt(document.querySelector(".invite-count").textContent) - 1;
      }
    }
  }

  function rejectRequestAction(friend) {
    document
      .querySelector(`#search-item-${friend.userId}`)
      ?.querySelector(`#search-accept-request-${friend.userId}`)
      .classList.add("d-none");
    document
      .querySelector(`#search-item-${friend.userId}`)
      ?.querySelector(`#search-reject-request-${friend.userId}`)
      .classList.add("d-none");
  }

  function removeFriendAction(friend) {
    document
      .querySelector(`#search-item-${friend.userId}`)
      ?.querySelector(`#search-remove-friend-${friend.userId}`)
      .classList.add("d-none");
    document
      .querySelector(`#search-item-${friend.userId}`)
      ?.querySelector(`#invite-${friend.userId}`)
      .classList.remove("d-none");
  }

  function inviteAction(friend) {
    document
      .querySelector(`#search-remove-sent-${friend.userId}`)
      .classList.remove("d-none");
    document.querySelector(`#invite-${friend.userId}`).classList.add("d-none");
  }

  function sendRemoveSent(friend, search = "") {
    document
      .querySelector(`#${search}remove-sent-${friend.userId}`)
      .addEventListener("click", (e) => {
        e.preventDefault();
        fetch("friends/remove", {
          method: "POST",
          mode: "same-origin",
          headers: { "X-CSRFToken": csrftoken },
          body: JSON.stringify({
            toRemove: friend.userId,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.successful) {
              sentPage = 1;
              getSent(sentPage);
              removeSentAction(friend);
            } else {
              console.err("something went wrong");
            }
          });
      });
  }
  function sendAccept(friend, search = "") {
    document
      .querySelector(`#${search}accept-request-${friend.userId}`)
      .addEventListener("click", (e) => {
        e.preventDefault();
        fetch("friends/accept", {
          method: "POST",
          mode: "same-origin",
          headers: { "X-CSRFToken": csrftoken },
          body: JSON.stringify({
            toAccept: friend.userId,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.successful) {
              // TODO: Modularize?
              sentPage = 1;
              getSent(sentPage);
              requestsPage = 1;
              getRequests(requestsPage);
              friendsPage = 1;
              getFriends(friendsPage);
              acceptRequestAction(friend);
              updateBadge();
            } else {
              console.err("something went wrong");
            }
          });
      });
  }
  function sendReject(friend, search = "") {
    document
      .querySelector(`#${search}reject-request-${friend.userId}`)
      .addEventListener("click", (e) => {
        e.preventDefault();
        fetch("friends/reject", {
          method: "POST",
          mode: "same-origin",
          headers: { "X-CSRFToken": csrftoken },
          body: JSON.stringify({
            toReject: friend.userId,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.successful) {
              // get requests
              requestsPage = 1;
              getRequests(requestsPage);
              rejectRequestAction(friend);
              updateBadge();
            } else {
              console.err("something went wrong");
            }
          });
      });
  }
  function sendInvite(friend) {
    document
      .querySelector(`#invite-${friend.userId}`)
      .addEventListener("click", (e) => {
        e.preventDefault();

        fetch("friends/invite", {
          method: "POST",
          mode: "same-origin",
          headers: { "X-CSRFToken": csrftoken },
          body: JSON.stringify({
            toInvite: friend.userId,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.successful) {
              // Reset invites
              sentPage = 1;
              getSent(sentPage);
              inviteAction(friend);
            } else {
              console.err("something went wrong");
            }
          });
      });
  }
  function sendRemoveFriend(friend, search = "") {
    document
      .querySelector(`#${search}remove-friend-${friend.userId}`)
      .addEventListener("click", (e) => {
        e.preventDefault();
        fetch("friends/removeFriend", {
          method: "POST",
          mode: "same-origin",
          headers: { "X-CSRFToken": csrftoken },
          body: JSON.stringify({
            toRemoveFriend: friend.userId,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.successful) {
              friendsPage = 1;
              getFriends(friendsPage);
              removeFriendAction(friend);
            } else {
              console.err("something went wrong");
            }
          });
      });
  }

  function setNavigation(friend, pageType) {
    document
      .querySelector(`.${pageType}-user-descrip-${friend.userId}`)
      .addEventListener("click", (e) => {
        document
          .querySelector(`.${pageType}-navigation-link-${friend.userId}`)
          .click();
      });
  }

  function displayMatching(type) {
    userId = type[0];
    type = type[1];
    document
      .querySelector(`#search-remove-sent-${userId}`)
      ?.classList.add("d-none");
    document.querySelector(`#invite-${userId}`)?.classList.add("d-none");
    document
      .querySelector(`#search-accept-request-${userId}`)
      ?.classList.add("d-none");
    document
      .querySelector(`#search-reject-request-${userId}`)
      ?.classList.add("d-none");
    document
      .querySelector(`#search-remove-friend-${userId}`)
      ?.classList.add("d-none");
    if (type == "S") {
      document
        .querySelector(`#search-remove-sent-${userId}`)
        .classList.remove("d-none");
    }
    if (type == "I") {
      document
        .querySelector(`#search-accept-request-${userId}`)
        .classList.remove("d-none");
      document
        .querySelector(`#search-reject-request--${userId}`)
        .classList.remove("d-none");
    }
    if (type == "F") {
      document
        .querySelector(`#search-remove-friend-${userId}`)
        .classList.remove("d-none");
    }
    if (type == "A") {
      document.querySelector(`#invite-${userId}`)?.classList.remove("d-none");
    }
  }

  // Function to list packs
  function listPacks(friends_obj, pageType, clear) {
    friends = friends_obj.friends;

    // remove everything in the current view
    if (clear) {
      if (pageType == "sent") {
        sentContainer.innerHTML = "";
      }
      if (pageType == "requests") {
        requestsContainer.innerHTML = "";
      }
      if (pageType == "all") {
        friendsContainer.innerHTML = "";
      }
      if (pageType == "search") {
        searchContainer.innerHTML = "";
      }
    }
    if (pageType == "sent") {
      friends.forEach((friend) => {
        sentContainer.innerHTML += sentItem(friend);
        // Initialize links
        setNavigation(friend, pageType);
        // Add event listener for regular remove button
        sendRemoveSent(friend);
      });
    }
    if (pageType == "requests") {
      friends.forEach((friend) => {
        requestsContainer.innerHTML += requestItem(friend);
        setNavigation(friend, pageType);
        sendAccept(friend);
        sendReject(friend);
      });
    }
    if (pageType == "all") {
      friends.forEach((friend) => {
        friendsContainer.innerHTML += friendItem(friend);
        setNavigation(friend, pageType);
        sendRemoveFriend(friend);
      });
    }
    if (pageType == "search") {
      friend_zip = friends.map((e, i) => {
        return [e, friends_obj.friend_types[i]];
      });
      friend_zip.forEach((i) => {
        let friend = i[0];
        let type = i[1];
        searchContainer.innerHTML += searchItem(friend);
        setNavigation(friend, pageType);
        sendRemoveSent(friend, searchPrefix);
        sendInvite(friend);
        sendRemoveFriend(friend, searchPrefix);
        sendAccept(friend, searchPrefix);
        sendReject(friend, searchPrefix);
        displayMatching(type);
      });
    }
  }

  function setLoadMoreEvents(pageType, loadMoreBtn, loadLessBtn) {
    if (pageType == "sent") {
      document.querySelector("#sent-buttons").appendChild(loadMoreBtn);
    } else if (pageType == "requests") {
      document.querySelector("#pending-buttons").appendChild(loadMoreBtn);
    } else if (pageType == "all") {
      document.querySelector("#friends-buttons").appendChild(loadMoreBtn);
    } else if (pageType == "search") {
      document.querySelector("#search-buttons").appendChild(loadMoreBtn);
    }
    loadMoreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (pageType == "sent") {
        sentPage++;
        fetch(`${[pageType]}/${sentPage}`)
          .then((res) => res.json())
          .then((res) => {
            sentLoadedCount = res.friends.length;
            listPacks(res, pageType, false);
            if (!res.more) {
              loadMoreBtn.classList.add("d-none");
            }
          });
      } else if (pageType == "requests") {
        requestsPage++;
        fetch(`${[pageType]}/${requestsPage}`)
          .then((res) => res.json())
          .then((res) => {
            requestsLoadedCount = res.friends.length;
            listPacks(res, pageType, false);
            if (!res.more) {
              loadMoreBtn.classList.add("d-none");
            }
          });
      } else if (pageType == "all") {
        friendsPage++;
        fetch(`${[pageType]}/${friendsPage}`)
          .then((res) => res.json())
          .then((res) => {
            friendsLoadedCount = res.friends.length;
            listPacks(res, pageType, false);
            if (!res.more) {
              loadMoreBtn.classList.add("d-none");
            }
          });
      } else if (pageType == "search") {
        searchPage++;
        fetch(`friends/${[pageType]}/${searchPage}`, {
          method: "POST",
          mode: "same-origin",
          headers: { "X-CSRFToken": csrftoken },
          body: JSON.stringify({
            queryString: lastSearch,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            searchLoadedCount = res.friends.length;
            listPacks(res, pageType, false);
            if (!res.more) {
              loadMoreBtn.classList.add("d-none");
            }
          });
      }
      loadLessBtn.classList.remove("d-none");
    });
  }
  function setLoadLessEvents(pageType, loadMoreBtn, loadLessBtn) {
    if (pageType == "sent") {
      document.querySelector("#sent-buttons").appendChild(loadLessBtn);
    } else if (pageType == "requests") {
      document.querySelector("#pending-buttons").appendChild(loadLessBtn);
    } else if (pageType == "all") {
      document.querySelector("#friends-buttons").appendChild(loadLessBtn);
    } else if (pageType == "search") {
      document.querySelector("#search-buttons").appendChild(loadLessBtn);
    }

    loadLessBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (pageType == "sent" && sentPage > 1) {
        sentPage--;
        for (let i = 0; i < sentLoadedCount; i++) {
          sentContainer.removeChild(sentContainer.lastChild);
        }
        if (sentPage == 1) {
          loadLessBtn.classList.add("d-none");
        }
      } else if (pageType == "requests" && requestsPage > 1) {
        requestsPage--;
        for (let i = 0; i < requestsLoadedCount; i++) {
          requestsContainer.removeChild(requestsContainer.lastChild);
        }
        if (requestsPage == 1) {
          loadLessBtn.classList.add("d-none");
        }
      } else if (pageType == "all" && friendsPage > 1) {
        friendsPage--;
        for (let i = 0; i < friendsLoadedCount; i++) {
          friendsContainer.removeChild(friendsContainer.lastChild);
        }
        if (friendsPage == 1) {
          loadLessBtn.classList.add("d-none");
        }
      } else if (pageType == "search" && searchPage > 1) {
        searchPage--;
        for (let i = 0; i < searchLoadedCount; i++) {
          searchContainer.removeChild(searchContainer.lastChild);
        }
        if (searchPage == 1) {
          loadLessBtn.classList.add("d-none");
        }
      }
      loadMoreBtn.classList.remove("d-none");
    });
  }
  function initLoadMore(pageType) {
    let loadMoreBtn = document.createElement("button");
    loadMoreBtn.classList.add("btn", "btn-outline-primary");
    loadMoreBtn.setAttribute("id", `show-more-btn-${pageType}`);
    loadMoreBtn.textContent = "Show more...";
    return loadMoreBtn;
  }
  function initLoadLess(pageType) {
    let loadLessBtn = document.createElement("button");
    loadLessBtn.classList.add("btn", "btn-outline-secondary", "d-none");
    loadLessBtn.setAttribute("id", `show-less-btn-${pageType}`);
    loadLessBtn.textContent = "Show less...";
    return loadLessBtn;
  }

  function navigationButtons(pageType) {
    const loadMore = initLoadMore(pageType);
    const loadLess = initLoadLess(pageType);
    setLoadMoreEvents(pageType, loadMore, loadLess);
    setLoadLessEvents(pageType, loadMore, loadLess);
  }

  function displayRes(res, pageType) {
    listPacks(res, pageType, true);
    if (res.more) {
      navigationButtons(pageType);
    }
  }
  async function getSent(sentPage) {
    await fetch(`friends/sent/${sentPage}`)
      .then((res) => res.json())
      .then((res) => {
        displayRes(res, "sent");
      });
  }
  getSent(sentPage);
  async function getRequests(requestsPage) {
    await fetch(`friends/requests/${requestsPage}`)
      .then((res) => res.json())
      .then((res) => {
        displayRes(res, "requests");
      });
  }
  getRequests(requestsPage);
  async function getFriends(friendsPage) {
    await fetch(`friends/all/${friendsPage}`)
      .then((res) => res.json())
      .then((res) => {
        displayRes(res, "all");
      });
  }

  function getSearch(sp, searchValue) {
    searchPage = sp;
    fetch(`friends/search/${sp}`, {
      method: "POST",
      mode: "same-origin",
      headers: { "X-CSRFToken": csrftoken },
      body: JSON.stringify({
        queryString: searchValue,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.friends.length > 0) {
          lastSearch = searchValue;
          displayRes(res, "search");
        } else {
          document.querySelector("#search-results").innerHTML =
            "No matches found";
        }
      });
  }
  getFriends(friendsPage);
  document.querySelector("#submit-search").addEventListener("click", (e) => {
    e.preventDefault();
    let searchValue = document.querySelector("#search_friend").value;
    if (!searchValue) {
      return;
    } else {
      getSearch(1, searchValue);
    }
  });
});
