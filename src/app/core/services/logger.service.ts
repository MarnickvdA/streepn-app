import * as Sentry from '@sentry/browser';
import {Severity} from '@sentry/browser';
import {environment} from '../../../environments/environment';

export interface LogItem {
    message: string;
    type?: 'default' | 'debug' | 'info' | 'error' | 'navigation' | 'http' | 'ui';
    category?: string;
    eventId?: string;
    data?: { [key: string]: any; };
    error?: any;
}

export class Logger {
    constructor(private LOG_TAG: string) {
    }

    info(logItem: LogItem) {
        if (!logItem.type) {
            logItem.type = 'info';
        }
        LoggerService.log(logItem, Severity.Info, this.LOG_TAG);
    }

    warn(logItem: LogItem) {
        if (!logItem.type) {
            logItem.type = 'default';
        }
        LoggerService.log(logItem, Severity.Warning, this.LOG_TAG);
    }

    error(logItem: LogItem) {
        if (!logItem.type) {
            logItem.type = 'error';
        }
        LoggerService.log(logItem, Severity.Warning, this.LOG_TAG);
    }
}

export class LoggerService {

    constructor() {
    }

    static getLogger(LOG_TAG: string): Logger {
        return new Logger(LOG_TAG);
    }

    static handleError(error) {
        try {
            LoggerService.log({
                type: 'error',
                message: 'Error occured and handled by handleError',
                error: error.originalError || error
            }, Severity.Error, 'Logger');
        } catch (e) {
            console.error(e);
        }
    }

    static log(logItem: LogItem, severity: Severity, tag: string) {
        if (!environment.production) {
            console.log(`${new Date(Date.now()).toLocaleString()} - (${severity}) - [ ${tag} ]: ${logItem.message}`);
            if (logItem.data) {
                console.log(logItem.data);
            }
            if (logItem.error) {
                console.error(logItem.error);
            }
        } else {
            Sentry.addBreadcrumb({
                type: logItem.type,
                level: severity,
                message: `[ ${tag} ]: ${logItem.message}`,
                category: logItem.category,
                event_id: logItem.eventId,
                data: logItem.data,
                timestamp: new Date(Date.now()).getTime()
            });

            if (logItem.error) {
                Sentry.withScope((scope) => {
                    scope.setLevel(Severity.fromString(severity));
                    Sentry.captureException(logItem.error);
                });
            }
        }
    }

    static setUserId(id: any) {
        Sentry.setUser({id});
    }
}
