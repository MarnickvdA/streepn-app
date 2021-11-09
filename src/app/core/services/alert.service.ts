import {Injectable} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {Queue} from '@core/utils/queue';
import {TranslateService} from '@ngx-translate/core';

interface AlertOption {
    type?: 'input' | 'button';
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
                private translate: TranslateService) {
    }

    promptAppError(error: AppErrorMessage) {
        switch (error) {
        }
    }

    promptApiError(error: ApiErrorMessage) {
        switch (error) {
        }
    }

    private promptError(header: string, message: string, canDismiss: boolean = true, options: AlertOption[]) {
        this.alertController.create({
            header,
            message,
            inputs: options.filter(o => o.type === 'input').map(o => ({
                text: o.text,
                role: o.type,
                handler: value => {
                    o.handler(value);
                    this.currentAlert = this.alertQueue.pop();
                }
            })),
            buttons: options.filter(o => o.type === 'button').map(o => ({
                text: o.text,
                role: o.type,
                handler: value => {
                    o.handler(value);
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
    notConnected // No internet connection
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
