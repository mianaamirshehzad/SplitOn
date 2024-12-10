// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTBcCwZ8KK4S35OMH1eiDfpO_xgwMWGFU",
  authDomain: "busserviceapp-209dc.firebaseapp.com",
  projectId: "busserviceapp-209dc",
  storageBucket: "busserviceapp-209dc.appspot.com",
  messagingSenderId: "439629919657",
  appId: "1:439629919657:web:0473384a2b9e699c7a40b8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
// const db = getFirestore(app);

export default app;
