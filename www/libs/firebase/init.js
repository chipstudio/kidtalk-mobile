
if (typeof firebase === 'undefined') throw new Error('hosting/init-error: Firebase SDK not detected. You must include it before /__/firebase/init.js');

// Uncomment to reference kidtalk-staging Firebase project
// firebase.initializeApp({
//   "projectId": "kidtalk-staging",
//   "databaseURL": "https://kidtalk-staging.firebaseio.com",
//   "storageBucket": "kidtalk-staging.appspot.com",
//   "locationId": "us-central",
//   "apiKey": "AIzaSyAGNXXwMSJpAOD9lztc72SnWyFiuTnhBTk",
//   "authDomain": "kidtalk-staging.firebaseapp.com",
//   "messagingSenderId": "125090554030"
// });

// Uncomment to reference kidtalkdev Firebase project
firebase.initializeApp({
  projectId: "kidtalkdev",
  databaseURL: "https://kidtalkdev.firebaseio.com",
  storageBucket: "kidtalkdev.appspot.com",
  locationId: "us-central",
  apiKey: "AIzaSyA0PIXbCd-y1lMHvccXXrUuPp0gfDtjVAQ",
  authDomain: "kidtalkdev.firebaseapp.com",
  messagingSenderId: "271962176686",
});