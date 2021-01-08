import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/functions';
import { environment } from '@env/environment';

// @ts-ignore
const app = firebase.default.initializeApp(environment.firebaseConfig);
app.auth().useEmulator('http://localhost:9099');
app.firestore().useEmulator('localhost', 8080);
app.functions().useEmulator('localhost', 5001);
