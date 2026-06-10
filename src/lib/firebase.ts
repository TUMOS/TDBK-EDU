/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDocFromServer,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err: any) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.warn('Persistence failed: Multiple tabs open.');
  } else if (err.code === 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.warn('Persistence failed: Browser not supported.');
  }
});

export const auth = getAuth();

// Tenant ID for isolation
const TENANT_ID = 'msa_academy_demo';

// Tenant-aware collection helper
export const getTenantCollection = (collName: string) => collection(db, 'institutions', TENANT_ID, collName);

// Tenant-aware doc helper
export const getTenantDoc = (collName: string, docId: string) => doc(db, 'institutions', TENANT_ID, collName, docId);

// Error handler definition per SKILL.md rules
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validation to check connection to Firestore on initialization
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
  }
}
testConnection();

// Direct CRUD helper methods to update records, wrapped nicely to prevent update leaks
export async function createDocument<T extends { id: string }>(collName: string, data: T): Promise<void> {
  const path = `institutions/${TENANT_ID}/${collName}/${data.id}`;
  try {
    await setDoc(getTenantDoc(collName, data.id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateDocument(collName: string, id: string, data: Record<string, any>): Promise<void> {
  const path = `institutions/${TENANT_ID}/${collName}/${id}`;
  try {
    await updateDoc(getTenantDoc(collName, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteDocument(collName: string, id: string): Promise<void> {
  const path = `institutions/${TENANT_ID}/${collName}/${id}`;
  try {
    await deleteDoc(getTenantDoc(collName, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Bulk initialization function to seed default collections when empty
export async function seedCollectionIfEmpty<T extends { id: string }>(collName: string, initialData: T[]): Promise<void> {
  try {
    const querySnapshot = await getDocs(getTenantCollection(collName));
    if (querySnapshot.empty) {
      console.log(`Seeding metadata and records for empty Firestore collection: ${collName}`);
      const batch = writeBatch(db);
      initialData.forEach(item => {
        const docRef = getTenantDoc(collName, item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collName);
  }
}
