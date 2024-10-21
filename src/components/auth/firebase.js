import { initializeApp } from 'firebase/app';
import { getAuth,GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBpLEnmih2cDOmt766AnV-EUZaCrXK7D4o",
    authDomain: "jobtracker-fa135.firebaseapp.com",
    projectId: "jobtracker-fa135",
    storageBucket: "jobtracker-fa135.appspot.com",
    messagingSenderId: "398822824017",
    appId: "1:398822824017:web:5cc6bc1076dba916908070",
    measurementId: "G-H49RM2Q0KX"
  };
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();