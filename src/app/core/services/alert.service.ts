import {Injectable} from '@angular/core';
import {AlertController, NavController} from '@ionic/angular';
import {Queue} from '@core/utils/queue';
import {TranslateService} from '@ngx-translate/core';

interface AlertOption {
    type?: 'input' | 'button';
    role?: 'cancel';
    text: string;
    handler?: (value: any) => void;
}

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    private currentAlert?: HTMLIonAlertElement;
    private alertQueue: Queue<HTMLIonAlertElement> = new Queue<HTMLIonAlertElement>();

    constructor(private alertController: AlertController,
                private translate: TranslateService,
                private navController: NavController) {
    }

    promptAppError(error: AppErrorMessage, data?: Record<string, any>) {
        switch (error) {
            case AppErrorMessage.cameraAccessDenied:
            case AppErrorMessage.expiredPasswordResetCode:
            case AppErrorMessage.invalidPasswordResetCode:
            case AppErrorMessage.userDisabled:
            case AppErrorMessage.userNotFound:
                this.promptError(
                    this.translate.instant('errors.error'),
                    this.translate.instant(error));
                break;
            case AppErrorMessage.unknown:
                this.promptError(
                    this.translate.instant('errors.error'),
                    this.translate.instant(error, { errorCode: data.errorCode })
                );
                break;
        }
    }

    promptApiError(error: ApiErrorMessage) {
        switch (error) {
            case ApiErrorMessage.unauthenticated:
            case ApiErrorMessage.permissionDenied:
            case ApiErrorMessage.houseNotFound:
            case ApiErrorMessage.userAccountNotFound:
            case ApiErrorMessage.sharedAccountNotFound:
            case ApiErrorMessage.productNotFound:
            case ApiErrorMessage.stockNotFound:
            case ApiErrorMessage.transactionNotFound:
            case ApiErrorMessage.houseAlreadyMember:
            case ApiErrorMessage.houseNotAdmin:
            case ApiErrorMessage.houseLeaveDenied:
            case ApiErrorMessage.houseCodeInvalid:
            case ApiErrorMessage.houseCodeExpired:
            case ApiErrorMessage.accountAlreadySettled:
                this.promptError(
                    this.translate.instant('errors.error'),
                    this.translate.instant(error));
                break;
            case ApiErrorMessage.houseNotMember:
                this.promptError(
                    this.translate.instant('errors.error'),
                    this.translate.instant(error),
                    this.createCloseButton('actions.back', () => {
                        this.navController.navigateRoot('/dashboard');
                    }));
                break;
            case ApiErrorMessage.internal:
            case ApiErrorMessage.invalidData:
            default:
                this.promptError(
                    this.translate.instant('errors.error'),
                    this.translate.instant('errors.functions.default', {errorCode: error.charCodeAt(error.length - 1)}));
        }
    }

    private createCloseButton(textKey = 'actions.close', handler?: () => void): AlertOption[] {
        return [
            {
                type: 'button',
                text: this.translate.instant(textKey),
                role: 'cancel',
                handler
            },
        ];
    }

    private promptError(header: string, message: string, options?: AlertOption[], canDismiss: boolean = true) {
        if (!options || options.length === 0) {
            options = [...this.createCloseButton()];
        }

        this.alertController.create({
            header,
            message,
            inputs: options.filter(o => o.type === 'input').map(o => ({
                text: o.text,
                role: o.type,
                handler: value => {
                    if (o.handler) {
                        o.handler(value);
                    }
                    this.currentAlert = this.alertQueue.pop();
                }
            })),
            buttons: options.filter(o => o.type === 'button').map(o => ({
                text: o.text,
                role: o.type,
                handler: value => {
                    if (o.handler) {
                        o.handler(value);
                    }
                    this.currentAlert = this.alertQueue.pop();
                }
            })),
            backdropDismiss: canDismiss
        }).then((alert) => {
            this.alertQueue.push(alert);

            if (!this.currentAlert) {
                this.currentAlert = this.alertQueue.pop();
                this.currentAlert.present();
            }
        });
    }
}

/**
 * There are several types of alerts: info, error, input
 *
 * For error alerts, it can be either API related or internal errors
 */

export enum AppErrorMessage {
    unknown = 'errors.unknown-error',
    cameraAccessDenied = 'errors.camera-access-denied',
    houseCreationFailed = 'errors.house-creation-failed',
    legalError = 'errors.legal-error',
    unknownLogin = 'errors.auth.unknown-login',
    unknownRegister = 'errors.auth.unknown-register',
    invalidPasswordResetCode = 'errors.auth.invalid-reset-code',
    expiredPasswordResetCode = 'errors.auth.expired-reset-code',
    userDisabled = 'errors.auth.user-disabled',
    userNotFound = 'errors.auth.user-not-found'
}

export enum ApiErrorMessage {
    // GENERAL
    internal = 'errors.functions.internal',
    unauthenticated = 'errors.functions.unauthenticated',
    permissionDenied = 'errors.functions.permission-denied',
    invalidData = 'errors.functions.invalid-data',

    // HOUSES
    houseNotFound = 'errors.functions.house-not-found',
    userAccountNotFound = 'errors.functions.user-account-not-found',
    sharedAccountNotFound = 'errors.functions.shared-account-not-found',
    productNotFound = 'errors.functions.product-not-found',
    houseNotMember = 'errors.functions.house-not-member',
    houseAlreadyMember = 'errors.functions.house-already-member',
    houseNotAdmin = 'errors.functions.house-not-admin',
    houseLeaveDenied = 'errors.functions.house-leave-denied',
    houseCodeInvalid = 'errors.functions.house-code-invalid',
    houseCodeExpired = 'errors.functions.house-code-expired',

    // STOCKS
    stockNotFound = 'errors.functions.stock-not-found',

    // TRANSACTIONS
    transactionNotFound = 'errors.functions.transaction-not-found',
    accountAlreadySettled = 'errors.functions.account-already-settled',
}
