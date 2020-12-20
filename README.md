Streepn App
==========

## System Requirements
* [Environment Setup](https://ionicframework.com/docs/intro/environment)
* [Ionic CLI](https://ionicframework.com/docs/intro/cli)

## Documentation
* [Ionic](https://ionicframework.com/docs)
* [Angular](https://angular.io/docs)
* [Capacitor](https://capacitor.ionicframework.com/docs/basics/workflow/)
* [Firebase](https://firebase.google.com/docs)
* [Ionic Components](https://github.com/ionic-team/ionic/tree/master/core/src/components)
* [Ionicons](https://ionicons.com/)

## Development
```
npm install
```

### Start the Firebase emulator
```
firebase emulators:start --import ./data --export-on-exit=./data
```

### Local native development
```
ng build -c local
ionic capacitor run ios|android --livereload-url=http://localhost:4200
# Run in XCode or in Android Studio

# OR NATIVE 
ng build
npm cap sync
npx cap open ios && npx cap open android
```

## Useful tools
#### Health checks
* `ionic doctor check`
* `npx cap doctor`

## Production builds
There are three different environment for which you can create a build:

```ng build --prod```

---
Sync to the native codebases of iOS and Android:

```npx cap sync```

---
Continue to native IDEs:

```npx cap open ios && npx cap open android```

### iOS
In XCode, make sure that 'Generic iOS Device' is selected at the App run field.

To create a build:
`Menu > Product > Archive` and then `Menu > Window > Organizer`. The app build can be validated and distributed to the App Store Connect platform.

- [App Store Connect](https://appstoreconnect.apple.com/)

### Android
To create a build: `Menu > Build > Generate Signed Bundle...`. Add the release key credentials and select the 'release' build variant. The release will be created and can be found in the Android Studio project under `app/prod/release`. The ABB can be uploaded to the Google Play console.

- [Play Store](https://play.google.com/apps/publish)a