# Kidtalk-Mobile (Android Version)
 
Overview
-----
KidTalk Android wraps the current webapp into an Ionic 3 wrapper that is then deployed onto Android devices. You can view a breakdown of the additional code in the `android` folder at the base of this repo. KidTalk iOS uses a similarly compatible, Phonegap wrapper.


Tech Stack:
-----
The Kidtalk Mobile Application versions are built on top of the tech stack that powers the KidTalk Web Application and utilize some of the additional benefits of native applications. The KidTalk Web Application code is built on a tech stack primarily consisting of: 

1) Google Firebase: Includes a Firebase database, Firestore Security Rules, Firebase Functions, and the Firebase API for queries and authentication.
2) Codewords: A custom modular frontend framework for organizing the different sections of the application.
3) Standard HTML, Javascript and CSS used within with individual Codewords.


Google Firebase:
-----

Kidtalk utilizes a Firebase database, Firestore Security Rules, Firebase Functions, and the Firebase API for queries and authentication in order to store information, provide login functionality, security, and to process recordings submitted by users among other data processing and storing tasks. 

The Firebase database is accessbile from within the Firebase Console which can be logged into through a web browser at: https://console.firebase.google.com/ . You will need the correct login credentials and connected account to access the KidTalk project from within the console.

The KidTalk Firebase Functions exist in the directory:

`<YOUR-PROJECT_DIRECTORY>/functions`

These 'functions' all have a .js extension. They are named according to ther function, for example: `crop_and_process.js` is responsible for taking the audio recording submitted by a user and both cropping and storing the recording with Firebase. For more information on Firebase Functions, please reference the official documentation: https://firebase.google.com/docs/functions

The KidTalk Firebase Firestore Security Rules exist in the file:

`<YOUR-PROJECT_DIRECTORY>/firestore.rules`

This file contains basic rules that prevent non-authenticated accounts from accessing the platform or a user from accessing a seperate users data.

The Firebase API is used throughout the entire application to connect with Google Firebase for user authentication, storing recordings, querying data and recordings and more. For more information about the Firebase API please reference the official documentation: https://firebase.google.com/docs/reference


Codeword Sections:
-----
The frontend code for the KidTalk Web Application is split up into several sections called "Codewords". Codewords is a custom framework which chunks the frontend/app interface code and Firebase database queries into discrete sections where all the code for that section lives. 

For example, in the application menu you can select the "Say What?" section of the app which will play recordings of children speaking, and you as the user can then submit a guess as to what they are saying. The html, css styles, and javascript code related to the frontend interface and Firebase queries related to this section exist in the file:

`<YOUR-PROJECT_DIRECTORY>/source/codewords guessing-game.html`

Codewords are reusable and as such you will find that some codewords pull in or reference other codewords as sub modules, not unlike other widely used frontend frameworks. 


Summary of Codeword Sections:
-----

All Codewords exist in the the `<YOUR-PROJECT_DIRECTORY>/source/codewords/` directory and have a `.html` extension. They range from files including the majority of code for a give section accessible through the application menu to simple buttons and links that are reused throughout. Here is a brief summary of the existing codewords.

1) `app-link.html`

A very simple codeword serving a link to other parts of the application.

2) `app-page.html`

Basic setup for each major section of the app, a blank template that is inherited by other codewords.

3) `clip-recorder.html`

The primary codeword for the "Recording" section of the app accessible from the menu.

4) `configure-settings.html`

This is where users can save and update their user and overall data sharing settings.

5) `family-management.html`

"My Family" in the menu. This is where users can update the children and adults in there household as well as who has shared access to there child's recordings.

6) `guessing-game.html`

This is the "Say What?" section of the application accessible from the main menu.

7) `home-page.html`

The home page that you see when you first open the application.

8) `icon-searcher.html`

This is used to load icons as users enter in details of there recording on both the "Recording" section of the app as well as when editing recording information in the scrapbook.

9) `informed-consent.html`

The informed consent document that users sign when agreeing to take part in the application.

10) `kidtalk-logo.html`

Contains a reusable SVG reference for displaying the KidTalk logo throughout the application.

11) `login-options.html`

Login options when logging in for the first time. Includes Google, Facebook, and Email.

12) `message-scientists.html`

A section with links to articles from the researchers using KidTalk and upcoming plans.

13) `pause-icon.html`

A reusable pause button for recordings.

14) `play-icon.html`

A reusable play button for recordings.

15) `record-icon.html`

A reusable play icon for recordings.

16) `recording-player.html`

Used in conjunction with clip-recorder.html

17) `scrapbook-section.html`

The "Scrapbook" section of the application. Includes the colored recording tiles, editing and search functionality for existing recordings and the ability to make snippets of existing recordings into new recordings.

18) `stop-icon.html`

A reusable stop icon for recordings.

19) `survey-questions.html`

Used to collect survey information at intervals for participants.

20) `svg-close.html`

A simple exit button.

21) `version-history.html`

See version-update.html, these work together.

22) `version-update.html`

Details about the version history of the app accessible from the main menu in "Version History".

