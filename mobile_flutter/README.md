# Flutter Mobile App Wrapper

This is the Flutter mobile application wrapper for the Resume Analyzer system. It serves the compiled React web application offline using a local web server (`InAppLocalhostServer`) and encapsulates it inside a WebView with custom hooks.

## Syncing Web Assets

Before building or running the Flutter app, you must sync the latest built assets from the frontend directory:

```bash
# Run the sync script from the root workspace directory
python sync_flutter.py
```

This script will compile the React frontend and copy all built assets directly to `mobile_flutter/assets/web/`.

## Running the App

To run the Flutter app:

```bash
# From the mobile_flutter directory
flutter pub get
flutter run
```
