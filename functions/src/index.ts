// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Firestore triggers
export {createUserObject} from './create-user-object.function';

// HTTP Functions
export {acceptTerms} from './accept-terms.function';

export {joinGroup} from './join-group.function';
export {leaveGroup} from './leave-group.function';

export {addStock} from './add-stock.function';
export {editStock} from './edit-stock.function';

export {addTransaction} from './add-transaction.function';
export {editTransaction} from './edit-transaction.function';

export {settleGroup} from './settle-group.function';
export {settleSharedAccount} from './settle-shared-account.function';

// Messaging functions
