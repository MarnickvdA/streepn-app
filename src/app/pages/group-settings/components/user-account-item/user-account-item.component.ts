import {Component, Input, OnInit} from '@angular/core';
import {UserAccount} from '../../../../models';
import {getMoneyString} from '../../../../utils/firestore-utils';
import {TranslateService} from '@ngx-translate/core';
import {NavController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../../services/auth.service';

@Component({
    selector: 'app-user-account-item',
    templateUrl: './user-account-item.component.html',
    styleUrls: ['./user-account-item.component.scss'],
})
export class UserAccountItemComponent implements OnInit {

    ownsAccount: boolean;
    @Input() account: UserAccount;

    constructor(private translate: TranslateService,
                private authService: AuthService,
                private navController: NavController,
                private router: Router,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.ownsAccount = this.authService.currentUser.uid === this.account.userId;
    }

    get balanceString(): string {
        return getMoneyString(this.account.balance);
    }

    openAccount() {
        const relativeRoute = this.router.createUrlTree(['accounts', this.account.id], {
            relativeTo: this.route
        });

        this.navController.navigateForward(relativeRoute, {
            state: {
                account: this.account
            }
        });
    }
}
