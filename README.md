# Distinctiveness and Complexity

Flashlearn is an application to help students and job seekers alike prepare for their next big test. It has a simple to use interface, is mobile friendly, and comes with a myriad of customization options.

Flashlearn is distinct from other similar apps as it allows for a wide range of customizations to how quizzes are constructed. Instead of merely viewing cards based on the order they were added to the pack, users can also view cards in randomized order, by difficulty, by keywords in the question, or by all of the above!
Furthermore, we have a feature to allow users to set timers to each question, and receive a hint if they get stuck.

Another special feature of the application is the ability for users to set privacies to their cardpacks. As some might not want to share their secret studying techniques, we allow packs to either be personal, visible to friends, or public.

Another unique feature of the application is for users to comment, like and favourite card packs. This allows users to gather feedback on their quizzes, as well as allow users to find packs more easily.

The complexity of the application comes in the customizability of the quiz formats. This requires extensive testing of many possible formats and the creation of a UI that provides seamless selection.

Furthermore, a search feature, favourites tab, friends feature and privacy tab all provide ways for users to filter packs, which again increases complexity as these filters can overlap.

## File Organization

### `capstone` project folder

- `settings.py` contains configurations of the overall project, such as the User model, application names and password authentication mechanisms
- `urls.py` contains relative url paths for each application

### `flashlearn` application folder

- `models.py` contains all class definitions for models used in the app
- `urls.py` contains all url patterns for relative url paths used by the application
- `tests.py` contains some test cases used for unit testing of the application
- `views.py` contains all backend django view logic of the application

- `template/flashlearn` contains all html files used in the application

  - `index.html` is the **home** page of the application
  - `profile.html` is the html for the profile of a user
  - `friends.html` is the friends listing page of a user
  - `add.html` is the page to add a new flash pack
  - `pack.html` is the page to view & edit the flash pack
  - `quiz.html` is the page for quiz questions

- `static/flashlearn` contains all static files used in the application
  - `styles.css` styling for navbar component
  - `styles_profile.css` styling for profile page
  - `styles_friends.css` styling for friends page
  - `styles_add.css` styling for add flash pack page
  - `styles_pack.css` styling for pack viewpage
  - `styles_quiz.css` styling for quiz section

## How to run the application

1. Open a terminal in the project folder
2. Run `python3 manage.py makemigrations flashlearn`
3. Then, run `python3 manage.py migrate`
4. Then, run `python3 manage.py runserver`
5. Navigate to the localhost URL to begin using the application!

## Additional Information

### Security

Security is paramount in preventing sabotage of learning resources. Accounts are backed by Django user authentication, and all POST/PUT requests sent to the backend are protected by a CSRF token.

### Scalability

If I ever intend to expand the application beyond CS50w, as mentioned in the lecture, I would have to look at database resources beyond sqlite. This includes migrating all data to other tools such as Postgres or even AWS cloud. Furthermore, instead of running the application locally, servers can be hosted on the cloud to ensure users across different machines/sessions can see each other's card packs.

### Speed / Efficiency

Speed & efficiency are also important for good user experience and for the process of active recall.

### Feedback

Lastly, even as we do not restrict learning methods of our users, some public cards packs might be offensive to other users. We will review each report and remove the card pack using superuser account if necessary.
