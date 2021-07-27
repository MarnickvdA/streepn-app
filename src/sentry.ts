import * as Sentry from '@sentry/browser';
import {environment} from './environments/environment';

export const initializeSentry = (): void => {
    Sentry.init({
        dsn: 'https://898ea0c4100341d581f3a5d645db3c12@o352784.ingest.sentry.io/5178411',
        debug: !environment.production,
        release: environment.version,
        environment: environment.production ? 'prod' : 'debug',
        tracesSampleRate: 1.0,
    });
};
