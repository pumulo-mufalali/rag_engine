/**
 * Firebase configuration initialization
 * 
 * This file sets up Firebase based on environment variables
 */

import { env } from './env';

/**
 * Firebase configuration object
 * Can be used to initialize Firebase services
 */
export const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
  ...(env.firebase.measurementId && { measurementId: env.firebase.measurementId }),
};

/**
 * Firebase emulator configuration
 * Used when VITE_USE_FIREBASE_EMULATOR is true
 */
export const firebaseEmulatorConfig = env.useEmulator
  ? {
      auth: {
        host: `${env.emulatorHost}:${env.emulatorPorts.auth}`,
        options: {
          disableWarnings: true,
        },
      },
      firestore: {
        host: `${env.emulatorHost}:${env.emulatorPorts.firestore}`,
        options: {
          ignoreUndefinedProperties: true,
        },
      },
    }
  : null;

/**
 * Example: Initialize Firebase (when you install Firebase SDK)
 * 
 * import { initializeApp } from 'firebase/app';
 * import { getAuth, connectAuthEmulator } from 'firebase/auth';
 * import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
 * 
 * const app = initializeApp(firebaseConfig);
 * 
 * // Initialize Auth
 * const auth = getAuth(app);
 * if (firebaseEmulatorConfig) {
 *   connectAuthEmulator(auth, `http://${firebaseEmulatorConfig.auth.host}`, {
 *     disableWarnings: true,
 *   });
 * }
 * 
 * // Initialize Firestore
 * const db = getFirestore(app);
 * if (firebaseEmulatorConfig) {
 *   connectFirestoreEmulator(db, ...);
 * }
 * 
 * export { auth, db };
 */

