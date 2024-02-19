# Firestore Migrator

A CLI tool for migrating collections, including nested sub-collections, between Firebase Firestore databases. This tool is designed to simplify the process of moving data across different Firestore projects, preserving the integrity of your data, including Firestore-specific types like Timestamps.

## Installation

You can install `firestore-migrator` globally using npm:

```bash
npm install -g firestore-migrator
```

This will install the tool globally on your system, allowing it to be run from anywhere.

## Prerequisites

Before you begin, ensure you have downloaded the service account JSON files for both the source and target Firestore databases from the Firebase project settings.

## Usage

To migrate a Firestore collection, run the following command:

```bash
firestore-migrator --source path/to/sourceServiceAccount.json --target path/to/targetServiceAccount.json --collection yourCollectionName
```

### Parameters:

* `--source, -s`: Path to the source Firestore service account JSON file.
* `--target, -t`: Path to the target Firestore service account JSON file.
* `--collection, -c`: Name of the collection to migrate.

## Current Limitations

* Large collections with deeply nested sub-collections might take a significant amount of time to migrate.
* Ensure you have sufficient permissions set in your Firebase project to read from the source and write to the target Firestore database.

## Contributing

If you'd like to contribute to the development of `firestore-migrator`, please feel free to make a pull request or open an issue.

## License

ISC License. See `LICENSE` for more information.

## Contact

kai@onino.io
