import { config } from 'dotenv';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env file
config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const configContent = `const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};`;

const publicDir = resolve(process.cwd(), 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

writeFileSync(resolve(publicDir, 'firebase-config.js'), configContent);

console.log('Firebase config for service worker generated successfully.');