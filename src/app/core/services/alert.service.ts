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

    promptAppError(error: AppErrorMessage) {
        switch (error) {
            case AppErrorMessage.cameraAccessDenied:
                this.promptError(
                    this.translate.instant('errors.error'),
                    this.translate.instant(error));
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
    cameraAccessDenied = 'errors.camera_access_denied',
    houseCreationFailed = 'errors.house_creation_failed',
    legalError = 'errors.legal_error',
    unknownLogin = 'errors.auth.unknown_login',
    unknownRegister = 'errors.auth.unknown_register',
}

export enum ApiErrorMessage {
    // GENERAL
    internal = 'errors.functions.internal',
    unauthenticated = 'errors.functions.unauthenticated',
    permissionDenied = 'errors.functions.permission_denied',
    invalidData = 'errors.functions.invalid_data',

    // HOUSES
    houseNotFound = 'errors.functions.house_not_found',
    userAccountNotFound = 'errors.functions.user_account_not_found',
    sharedAccountNotFound = 'errors.functions.shared_account_not_found',
    productNotFound = 'errors.functions.product_not_found',
    houseNotMember = 'errors.functions.house_not_member',
    houseAlreadyMember = 'errors.functions.house_already_member',
    houseNotAdmin = 'errors.functions.house_not_admin',
    houseLeaveDenied = 'errors.functions.house_leave_denied',
    houseCodeInvalid = 'errors.functions.house_code_invalid',
    houseCodeExpired = 'errors.functions.house_code_expired',

    // STOCKS
    stockNotFound = 'errors.functions.stock_not_found',

    // TRANSACTIONS
    transactionNotFound = 'errors.functions.transaction_not_found',
    accountAlreadySettled = 'errors.functions.account_already_settled',
}
