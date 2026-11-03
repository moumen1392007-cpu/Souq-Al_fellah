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

// ضع معلومات مشروع Firebase الخاص بك هنا لاحقاً
const firebaseConfig = {
apiKey: "YOUR_API_KEY",
authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
projectId: "YOUR_PROJECT_ID",
storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
appId: "YOUR_APP_ID"
};

export const firebaseReady =
firebaseConfig.apiKey !== "YOUR_API_KEY" &&
firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app = null;

export let auth = null;
export let db = null;
export let storage = null;
export let googleProvider = null;

if (firebaseReady) {
app = initializeApp(firebaseConfig);

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

googleProvider = new GoogleAuthProvider();

}
