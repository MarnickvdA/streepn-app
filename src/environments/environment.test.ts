export const environment = {
    production: false,
    firebaseConfig: {
        apiKey: 'AIzaSyAZ-Tr665a5_sviBqc45MmIefViccnMU48',
        authDomain: 'streepn-test.firebaseapp.com',
        projectId: 'streepn-test',
        storageBucket: 'streepn-test.appspot.com',
        messagingSenderId: '43751656245',
        appId: '1:43751656245:web:b6bbb386a8968fbce5da7c'
    },
    adId: {
        android: {
            banner: '',
            interstitial: '',
        },
        ios: {
            banner: '',
            interstitial: ''
        },
    },
    legalVersion: '1',
    legalUrl: 'https://streepn.nl/legal',
    privacyUrl: 'https://streepn.nl/privacy',
    version: require('../../package.json').version,
};
