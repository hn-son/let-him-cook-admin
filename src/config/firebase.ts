import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import env from './environment';

const firebaseConfig = {
    apiKey: env.API_KEY,
    authDomain: env.AUTH_DOMAIN,
    projectId: env.PROJECT_ID,
    storageBucket: env.STORAGE_BUCKET,
    messagingSenderId: env.MESSAGING_SENDER_ID,
    appId: env.APP_ID,
};

firebase.initializeApp(firebaseConfig);
const firebaseStorage = getStorage();
export default firebase;
export { firebaseStorage, ref, uploadBytes, getDownloadURL, deleteObject };
