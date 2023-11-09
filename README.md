# Introducing Flashlearn

Flashlearn is **the** application to strengthen your understanding of concepts through the power of active recall. Through the power of customizable flashcards, quiz yourself content which you or your peers have curated to be best fit your learning. Share your card packs with others and find new ways to push your mastery of the subject to its limits!

## Features

1. Filter, sort & search for packs!
2. Create your own packs!
3. Edit your created packs!
4. Play the pack game!
5. Invite other users as friends!
6. View user packs on their profiles, or customize your own profile!

## Distinctiveness and Complexity

Flashlearn offers a unique experience in learning through active recall. Instead of simple flashcards which might only contain a question & answer, our cards can also provide hints and even images for those who are struggling or for those who opt for a more visual learning experience. Furthermore, cards can ranked based on difficulty of the question/answer. This could help isolate hard, important questions, allowing players to have a better chance of remembering them. Furthermore, Flashlearn also provides a customizable player experience by allowing players to select orders in which cards are shown, handicaps and round durations. This way, everyone can learn at their own pace.

Players can also view their score relative to that of all played attempts, allowing them to gauge how much more effort they might need to put in into understanding the content. Note that metrics like best & average score are only available to users who have signed up.

Apart from just attempting the quizzes, logged in users can also create their own card packs using the `create` feature. Users can provide custom names to their packs, add a description of just about anything about their pack, specify a category for their pack to make it easier to find, and set a privacy for their packs so that maybe only their friends or themselves would be able to play it (although I do recommend everyone get a chance to play them!). Users can also of course add cards (minimally 1) to their packs.

Additionally, Flashlearn allows users to search for, filter and sort packs shown on the homepage based on various criteria such as date, category, name order, recency order, like count order and average difficulty order. This way, users can find the most popular packs, or find those which are more challenging. The search feature allows users to find packs which have names, ids, creator names or even descriptions which contain words in their search string.

As I value the uniqueness of every player, Flashlearn also offers users the ability to edit their profile images.

Furthermore, in a user's profile, we can view the packs that the user had created, the packs they had liked as well as those which they have favourited (for their own profile). This allows other users to see what this user had contributed to this learning space, and see what packs have caught their interest!

From changing the description to editing the answers on the individual cards themselves, Flashlearn offers the opportunity for creators of the pack to edit the packs they have created. This is helpful in encouraging users to continuously look back at how they can improve their learning.

Lastly, the `friends` feature is what I believe is another unique feature of Flashlearn. Not only does it allow users to stay updated on all packs created by their friends, but it also provides users a chance to create special quizzes dedicated for inter-friend play, allowing them to generate play statistics uniquely for their friends.

I believe that Flashlearn is complex.

Starting from the homepage itself, I offer multiple, overlapping ways for users to customize their search requirements. This process is complex as there are different directions of `order_by`, fields to `order_by`, and fields to `filter` entirely based on what had been selected. Furthermore, as filtering and sorting can happen before **and** after searching, there also needs to be some mechanism to remember what the user had last searched for prior to clicking the `Submit` button.

Then, the profile page also has its own complexities. Checks have to be made on whether the profile belongs to the current user, in which case new tabs like "Favourites" will be loaded, as well as the form for the user to edit their profile image. As saving image data is generally a hard task, there is a level of complexity in retrieving the image from the input, knowing if the user even has anything to update, and knowing if the user actually wants to remove the image (in which case we need to find and delete the image stored in the image folder).

Next, an even more complex feature is the `create` feature. Here, validation checks are added to ensure the user does not submit a packs without a name or without a card. If there are problems, I actually bring the user to the tab which has the error and display the error warning. Again, these warnings have to be removed once they are resolved. Cards themselves also have errors warnings, for when the user does not enter minimally a question and an answer for the card. There is also alot of complexity when "removing" an added card since I decided not to make the removal permanent (in case the user decides to actually include it but does not want to retype everything again). In this case, the card has to be marked as "removed" and be made uneditable, unless the "undo" button is pressed. "Removed" cards should not be passed to the backend or considered official pack cards. On top of that, the image upload and removal complexities from earlier in the profile image are once again seen here, but this time with the added complexity of having to keep track of the image for every single card added.

Then, an even more complex feature than `create` is the `friends` feature. This is because our `friends` feature offers users the ability to send requests to other users (so we don't force a friendship), after which the recipient can either accept or reject the request to confirm the friendship. Users can also choose to remove the sent request, upon which they can re-invite the other user again. A user can also remove their added friends, upon which the friendship is terminated on both ends. The user can also search for other users using the search feature, which searches based on a username or userId. From the search results, we can also perform all the operations listed above, making things easier for the user. I also allow users to send requests to each other. If 1 of these users accepts, then the request sent by the other is removed. However, if the request is rejected, it simply removes the request without removing their own request sent. Furthermore, there is complexity in ensuring that the buttons shown in the search results and the other lists are consistent, and that everything on the page is updated in real time without the page having to reload.

Then, the pack pages also have their own complexities. This mainly stems from generating the plot to view the play statistics, as well as maintaining a more complex version of the card lists used in the `create` feature for the `edit` feature. The `edit` feature's card list is more complex as we need to maintain which are new and old cards, which of the old cards we want to delete, and which of the new cards we don't really want to send over to Django to be added. Then, I also need to ensure all previous plays for the pack are voided since the scores may no longer tally up with the new card count. Furthermore, the like and dislike buttons need to be mutually exclusive, and be highlighted when the page initially loads (same for the favourite button).

There is also some complexity in the navbar for the friends tab, which displays a small badge for the number of received invitations the user currently has. This needs to be maintained across all pages, and should update upon rejecting/accepting a request.

The game itself is complex since we need to update the scores immediately after the user had been confirmed to finish the game, as well as match the user's answers and the actual answers based on regular expressions. Implementing a countdown is also requires good knowledge of time interval tracking.

The registration process also requires a "complex" password, which adds extra checks needed to be implemented in the frontend.

Lastly, the frontend responsiveness is also another layer of complexity of the application since navbar will change to a burger dropdown, packs will be arranged differently, and profile will be in "column" view.

## File Organization

### `capstone` project folder

- `settings.py` contains configurations of the overall project, such as the User model, application names and password authentication mechanisms
- `urls.py` contains relative url paths for each application

### `flashlearn` application folder

- `models.py` contains all class definitions for models used in the app, and definitions for serializations and image locations.
- `urls.py` contains all url patterns for relative url paths used by the application
- `tests.py` contains some test cases used for unit testing of the application
- `views.py` contains all backend django view logic of the application

- `template/flashlearn` contains all html files used in the application

  - `base.html` is the html for the top navbar
  - `index.html` is the homepage of the application
  - `profile.html` is the html for the profile of a user
  - `friends.html` is the friends listing page of a user
  - `add.html` is the page to add a new flash pack
  - `pack.html` is the page to view & edit the flash pack
  - `login.html` is the html for login page
  - `register.html` is the html for register page

- `static/flashlearn` contains all static files used in the application
  - `base.js` is the javascript for the navbar
  - `create.js` is the javascript for the create page
  - `friends.js` is the javascript for the friends page
  - `index.css` is css for the homepage
  - `index.js` is the js for the homepage
  - `pack.js` is the js for the pack's page
  - `profile.js` is the js for the profile's page
  - `styles.css` styling for navbar component
  - `styles_profile.css` styling for profile page
  - `styles_friends.css` styling for friends page
  - `styles_create.css` styling for add flash pack page
  - `styles_pack.css` styling for pack viewpage
  - `styles_signup.css` styling for login/signup section

## How to run the application

1. Open a terminal in the project folder
2. Run `python3 manage.py makemigrations flashlearn` in root project directory terminal
3. Then, run `python3 manage.py migrate`
4. Then, run `python3 manage.py runserver`
5. Navigate to the localhost URL to begin using the application!

<br>
6. If no Categories are available, add your own using

6.1. `python3 manage.py shell` command in root project directory in terminal
6.2 Then import the Category model by using `from flashlearn.models import Category`
6.3 Then add whatever Categories you want using `cat = Category(name="xxx")` followed by `cat.save()`

## Additional Information

### Security

Security is paramount in preventing sabotage of learning resources. Accounts are backed by Django user authentication, and all POST/PUT requests sent to the backend are protected by a CSRF token.

### Scalability

If I ever intend to expand the application beyond CS50w, as mentioned in the lecture, I would have to look at database resources beyond sqlite. This includes migrating all data to other tools such as Postgres or even AWS cloud. Furthermore, instead of running the application locally, servers can be hosted on the cloud to ensure users across different machines/sessions can see each other's card packs.

### Speed / Efficiency

Speed & efficiency are also important for good user experience and for the process of active recall.
