export const environment = {
    production: false,
    firebaseConfig: {
        apiKey: 'AIzaSyDfIykH2j6XY7sT0k_4KoYE0SI5Ok27kDM',
        authDomain: 'streepn-app.firebaseapp.com',
        projectId: 'streepn-app',
        storageBucket: 'streepn-app.appspot.com',
        messagingSenderId: '378314194804',
        appId: '1:378314194804:web:fdcf8d1aeba0eb401d7621',
        measurementId: 'G-D380G3HEPZ'
    },
    adId: {
        android: {
            banner: 'ca-app-pub-3940256099942544/2934735716',
            interstitial: 'ca-app-pub-3940256099942544/1033173712',
        },
        ios: {
            banner: 'ca-app-pub-3940256099942544/2934735716',
            interstitial: 'ca-app-pub-3940256099942544/1033173712'
        },
    },
    legalVersion: '1',
    legalUrl: 'https://streepn.nl/legal',
    privacyUrl: 'https://streepn.nl/privacy',
    version: require('../../package.json').version,
};
