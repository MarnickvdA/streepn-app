export const environment = {
    production: true,
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
            banner: 'ca-app-pub-5133412357979129/5640191956',
            interstitial: 'ca-app-pub-5133412357979129/1613123517',
        },
        ios: {
            banner: 'ca-app-pub-5133412357979129/8785036526',
            interstitial: 'ca-app-pub-5133412357979129/9575374014'
        },
    },
    legalVersion: '1',
    legalUrl: 'https://streepn.nl/legal',
    privacyUrl: 'https://streepn.nl/privacy',
    version: require('../../package.json').version,
};
