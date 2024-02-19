#!/usr/bin/env node

/**
 * Firestore Migration Tool
 *
 * This script facilitates the migration of collections from one Firestore database to another.
 * It uses the Firebase Admin SDK to authenticate and perform operations on Firestore instances.
 *
 * Usage:
 *  node scriptName.js --source path/to/sourceServiceAccount.json --target path/to/targetServiceAccount.json --collection collectionName
 */

const admin = require("firebase-admin");
const yargs = require("yargs");

// Parse command line arguments
const argv = yargs
  .usage("Usage: $0 --source [str] --target [str] --collection [str]")
  .help("h")
  .alias("h", "help")
  .options({
    source: {
      description: "The path to the source Firestore service account JSON file",
      requires: true,
      alias: "s",
      type: "string",
    },
    target: {
      description: "The path to the target Firestore service account JSON file",
      requires: true,
      alias: "t",
      type: "string",
    },
    collection: {
      description: "The name of the collection to migrate",
      requires: true,
      alias: "c",
      type: "string",
    },
  }).argv;

/**
 * Initializes Firebase applications for source and target Firestore databases.
 *
 * @param {string} sourceConfig - Path to the source Firestore service account file.
 * @param {string} targetConfig - Path to the target Firestore service account file.
 */
function initializeFirebaseApps(sourceConfig, targetConfig) {
  admin.initializeApp(
    {
      credential: admin.credential.cert(require(sourceConfig)),
    },
    "sourceApp"
  );

  admin.initializeApp(
    {
      credential: admin.credential.cert(require(targetConfig)),
    },
    "targetApp"
  );
}

/**
 * Recursively exports a Firestore collection and its sub-collections.
 *
 * @param {FirebaseFirestore.Firestore} db - Firestore database instance.
 * @param {string} path - Path of the collection or sub-collection to export.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the exported data.
 */
async function exportCollectionRecursively(db, path) {
  let data = {};
  const snapshot = await db.collection(path).get();

  for (const doc of snapshot.docs) {
    const docData = doc.data();
    const subCollections = await doc.ref.listCollections();
    data[`${path}/${doc.id}`] = docData;

    for (const subCollection of subCollections) {
      const subPath = `${path}/${doc.id}/${subCollection.id}`;
      Object.assign(data, await exportCollectionRecursively(db, subPath));
    }
  }

  return data;
}

/**
 * Imports data into the target Firestore database.
 *
 * @param {FirebaseFirestore.Firestore} db - Firestore database instance.
 * @param {Object} data - The data to import.
 */
async function importCollection(db, data) {
  const batch = db.batch();
  Object.keys(data).forEach((originalPath) => {
    const docRef = db.doc(originalPath);
    batch.set(docRef, data[originalPath]);
  });

  await batch.commit();
  console.log("Data has been imported into the target Firestore.");
}

/**
 * Performs the migration of a Firestore collection including its sub-collections.
 *
 * @param {string} source - Path to the source Firestore service account file.
 * @param {string} target - Path to the target Firestore service account file.
 * @param {string} collectionName - Name of the collection to migrate.
 */
async function migrateData(source, target, collectionName) {
  try {
    initializeFirebaseApps(source, target);
    const sourceDb = admin.app("sourceApp").firestore();
    console.log(
      `Starting export of '${collectionName}' collection and its sub-collections.`
    );
    const exportedData = await exportCollectionRecursively(
      sourceDb,
      collectionName
    );
    console.log(`Export completed for '${collectionName}'.`);

    const targetDb = admin.app("targetApp").firestore();
    console.log(`Starting import to the target Firestore.`);
    await importCollection(targetDb, exportedData);
    console.log(`Migration completed for collection: '${collectionName}'.`);
  } catch (error) {
    console.error("Migration encountered an error:", error);
    process.exit(1);
  }
}

// Execute the migration with CLI arguments
migrateData(argv.source, argv.target, argv.collection);
