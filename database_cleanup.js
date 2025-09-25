// Temporary Database Cleanup Script
// This script helps clean Firestore database by removing specific fields from collections
// WARNING: This script will permanently delete data. Use with caution!

// Firebase configuration (same as your project)
const firebaseConfig = {
    apiKey: "AIzaSyClXV9PzskFjGVzTa2OVG3nJQZ170qjrrE",
    authDomain: "pesalai-undergraduate.firebaseapp.com",
    projectId: "pesalai-undergraduate",
    storageBucket: "pesalai-undergraduate.firebasestorage.app",
    messagingSenderId: "819849679669",
    appId: "1:819849679669:web:418491be5cbfa0fc62b27c",
    measurementId: "G-T9X602C1X2"
};

// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configuration
const DRY_RUN = true; // Set to false to actually perform deletions
const BATCH_SIZE = 10; // Process documents in batches

// Collections and their fields to clean
const COLLECTIONS_TO_CLEAN = {
    'students': {
        // Fields to remove from students collection
        fieldsToRemove: ['tempField', 'oldField', 'unusedField'],
        // Or remove all fields except these (whitelist approach)
        fieldsToKeep: ['indexNo', 'name', 'batch', 'phone', 'email', 'address']
    },
    'classAttendance': {
        fieldsToRemove: ['tempField'],
        fieldsToKeep: ['date', 'studentId', 'attended', 'timestamp']
    },
    'exams': {
        fieldsToRemove: ['tempField'],
        fieldsToKeep: ['batch', 'subject', 'date', 'status', 'attendance', 'totalIncome']
    },
    'expenses': {
        fieldsToRemove: ['tempField'],
        fieldsToKeep: ['amount', 'reason', 'date', 'type']
    },
    'examAttendance': {
        fieldsToRemove: ['tempField'],
        fieldsToKeep: ['examId', 'studentId', 'attended', 'feePaid']
    },
    'marks': {
        fieldsToRemove: ['tempField'],
        fieldsToKeep: ['examId', 'studentId', 'marks', 'grade']
    }
};

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = DRY_RUN ? '[DRY RUN]' : '[LIVE]';
    console.log(`${prefix} [${timestamp}] ${type.toUpperCase()}: ${message}`);
}

function confirmAction(message) {
    // In a real environment, you might want to use readline or similar
    console.log(`CONFIRMATION REQUIRED: ${message}`);
    return true; // For script purposes, return true. In production, implement proper confirmation
}

// Main cleanup functions
async function removeFieldsFromCollection(collectionName, config) {
    log(`Starting cleanup for collection: ${collectionName}`);
    
    try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) {
            log(`Collection ${collectionName} is empty`);
            return;
        }
        
        log(`Found ${snapshot.docs.length} documents in ${collectionName}`);
        
        const docsToUpdate = [];
        
        // Analyze documents and prepare updates
        snapshot.docs.forEach(docSnapshot => {
            const docData = docSnapshot.data();
            const docId = docSnapshot.id;
            
            if (config.fieldsToRemove) {
                // Remove specific fields
                const fieldsToRemove = config.fieldsToRemove.filter(field => docData.hasOwnProperty(field));
                if (fieldsToRemove.length > 0) {
                    docsToUpdate.push({
                        id: docId,
                        data: docData,
                        fieldsToRemove: fieldsToRemove,
                        action: 'removeFields'
                    });
                }
            }
            
            if (config.fieldsToKeep) {
                // Keep only specific fields (remove all others)
                const fieldsToRemove = Object.keys(docData).filter(field => !config.fieldsToKeep.includes(field));
                if (fieldsToRemove.length > 0) {
                    docsToUpdate.push({
                        id: docId,
                        data: docData,
                        fieldsToRemove: fieldsToRemove,
                        action: 'keepOnlyFields'
                    });
                }
            }
        });
        
        if (docsToUpdate.length === 0) {
            log(`No documents need updating in ${collectionName}`);
            return;
        }
        
        log(`Found ${docsToUpdate.length} documents to update in ${collectionName}`);
        
        // Process in batches
        for (let i = 0; i < docsToUpdate.length; i += BATCH_SIZE) {
            const batch = docsToUpdate.slice(i, i + BATCH_SIZE);
            await processBatch(collectionName, batch);
        }
        
        log(`Completed cleanup for collection: ${collectionName}`);
        
    } catch (error) {
        log(`Error cleaning collection ${collectionName}: ${error.message}`, 'error');
    }
}

async function processBatch(collectionName, batch) {
    if (DRY_RUN) {
        log(`[DRY RUN] Would process batch of ${batch.length} documents in ${collectionName}`);
        batch.forEach(doc => {
            log(`[DRY RUN] Would ${doc.action} fields: ${doc.fieldsToRemove.join(', ')} from document ${doc.id}`);
        });
        return;
    }
    
    try {
        const firestoreBatch = writeBatch(db);
        
        batch.forEach(docUpdate => {
            const docRef = doc(db, collectionName, docUpdate.id);
            
            if (docUpdate.action === 'removeFields') {
                // Remove specific fields
                const updateData = {};
                docUpdate.fieldsToRemove.forEach(field => {
                    updateData[field] = null; // Firestore uses null to delete fields
                });
                firestoreBatch.update(docRef, updateData);
            } else if (docUpdate.action === 'keepOnlyFields') {
                // Keep only specific fields (recreate document with only desired fields)
                const newData = {};
                docUpdate.fieldsToKeep.forEach(field => {
                    if (docUpdate.data.hasOwnProperty(field)) {
                        newData[field] = docUpdate.data[field];
                    }
                });
                firestoreBatch.set(docRef, newData);
            }
        });
        
        await firestoreBatch.commit();
        log(`Successfully processed batch of ${batch.length} documents in ${collectionName}`);
        
    } catch (error) {
        log(`Error processing batch in ${collectionName}: ${error.message}`, 'error');
    }
}

// Specific cleanup functions for common scenarios
async function removeTempFields() {
    log('Removing temporary fields from all collections');
    
    for (const [collectionName, config] of Object.entries(COLLECTIONS_TO_CLEAN)) {
        await removeFieldsFromCollection(collectionName, {
            fieldsToRemove: ['tempField', 'temp', 'temporary', 'test', 'debug', 'old']
        });
    }
}

async function removeUnusedFields() {
    log('Removing unused fields from all collections');
    
    const unusedFields = ['createdAt', 'updatedAt', 'lastModified', 'version', 'metadata'];
    
    for (const [collectionName, config] of Object.entries(COLLECTIONS_TO_CLEAN)) {
        await removeFieldsFromCollection(collectionName, {
            fieldsToRemove: unusedFields
        });
    }
}

async function cleanSpecificCollection(collectionName, fieldsToRemove) {
    log(`Cleaning specific collection: ${collectionName}`);
    
    if (!COLLECTIONS_TO_CLEAN[collectionName]) {
        log(`Collection ${collectionName} not found in configuration`, 'error');
        return;
    }
    
    await removeFieldsFromCollection(collectionName, {
        fieldsToRemove: fieldsToRemove
    });
}

// Main execution function
async function runCleanup() {
    log('Starting database cleanup process');
    log(`Mode: ${DRY_RUN ? 'DRY RUN (no actual changes)' : 'LIVE (will make actual changes)'}`);
    
    if (!DRY_RUN) {
        const confirmed = confirmAction('Are you sure you want to proceed with LIVE mode? This will permanently delete data!');
        if (!confirmed) {
            log('Cleanup cancelled by user', 'warning');
            return;
        }
    }
    
    try {
        // Choose your cleanup strategy:
        
        // Option 1: Remove temporary fields
        await removeTempFields();
        
        // Option 2: Remove unused fields
        // await removeUnusedFields();
        
        // Option 3: Clean specific collection
        // await cleanSpecificCollection('students', ['tempField', 'oldField']);
        
        // Option 4: Clean all collections with custom configuration
        // for (const [collectionName, config] of Object.entries(COLLECTIONS_TO_CLEAN)) {
        //     await removeFieldsFromCollection(collectionName, config);
        // }
        
        log('Database cleanup completed successfully');
        
    } catch (error) {
        log(`Cleanup failed: ${error.message}`, 'error');
    }
}

// Export functions for use in other scripts
export {
    runCleanup,
    removeFieldsFromCollection,
    removeTempFields,
    removeUnusedFields,
    cleanSpecificCollection,
    COLLECTIONS_TO_CLEAN
};

// Run the cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runCleanup().catch(console.error);
}

// Usage examples:
/*
// Example 1: Remove temporary fields
await removeTempFields();

// Example 2: Remove specific fields from students collection
await cleanSpecificCollection('students', ['tempField', 'oldField', 'unusedField']);

// Example 3: Clean all collections with custom configuration
for (const [collectionName, config] of Object.entries(COLLECTIONS_TO_CLEAN)) {
    await removeFieldsFromCollection(collectionName, config);
}

// Example 4: Remove unused metadata fields
await removeUnusedFields();
*/
