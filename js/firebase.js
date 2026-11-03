// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZwlu-XEMmcXgpu-7JrnI4My62YJRJuSE",
  authDomain: "souq-alfellah.firebaseapp.com",
  projectId: "souq-alfellah",
  storageBucket: "souq-alfellah.firebasestorage.app",
  messagingSenderId: "348751722693",
  appId: "1:348751722693:web:0d2de335e3166b8aba18ac",
  measurementId: "G-GYWDV749D4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
const auth = getAuth(app);

// Google login
const googleProvider = new GoogleAuthProvider();

// Firestore database
const db = getFirestore(app);

// Firebase Storage
const storage = getStorage(app);

// Firebase status
const firebaseReady = true;

// Export services
export {
  app,
  auth,
  googleProvider,
  db,
  storage,
  firebaseReady
};
