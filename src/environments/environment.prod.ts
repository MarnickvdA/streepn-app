export const environment = {
    production: true,
    firebaseConfig: {
        apiKey: 'AIzaSyBFg-okgC8q0Axa_CH_RJu4v1Oz98bSF8M',
        authDomain: 'streepn-app.firebaseapp.com',
        projectId: 'streepn-app',
        storageBucket: 'streepn-app.appspot.com',
        messagingSenderId: '378314194804',
        appId: '1:378314194804:web:2f9501eb73ef5ceb1d7621',
        measurementId: 'G-3HNCNE1EFD'
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
    legalUrl: 'https://streepn.nl/legal?version=1',
    version: require('../../package.json').version,
};
