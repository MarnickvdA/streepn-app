import * as Sentry from '@sentry/browser';
import {Severity} from '@sentry/browser';
import {environment} from '@env/environment';

export interface LogItem {
    message: string;
    type?: 'default' | 'debug' | 'info' | 'error' | 'navigation' | 'http' | 'ui';
    category?: string;
    eventId?: string;
    data?: { [key: string]: any };
    error?: any;
}

export class Logger {
    constructor(private logTag: string) {
    }

    info(logItem: LogItem) {
        if (!logItem.type) {
            logItem.type = 'info';
        }
        LoggerService.log(logItem, Severity.Info, this.logTag);
    }

    warn(logItem: LogItem) {
        if (!logItem.type) {
            logItem.type = 'default';
        }
        LoggerService.log(logItem, Severity.Warning, this.logTag);
    }

    error(logItem: LogItem) {
        if (!logItem.type) {
            logItem.type = 'error';
        }
        LoggerService.log(logItem, Severity.Warning, this.logTag);
    }
}

export class LoggerService {

    constructor() {
    }

    static getLogger(logTag: string): Logger {
        return new Logger(logTag);
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
                // eslint-disable-next-line @typescript-eslint/naming-convention
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
        if (environment.production) {
            Sentry.setUser({id});
        }
    }
}
