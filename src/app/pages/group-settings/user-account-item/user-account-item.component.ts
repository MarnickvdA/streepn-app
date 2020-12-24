import {Component, Input, OnInit} from '@angular/core';
import {UserAccount} from '../../../models';
import {getMoneyString} from '../../../utils/firestore-utils';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../../services/user.service';
import {NavController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-user-account-item',
    templateUrl: './user-account-item.component.html',
    styleUrls: ['./user-account-item.component.scss'],
})
export class UserAccountItemComponent implements OnInit {

    ownsAccount: boolean;
    @Input() account: UserAccount;

    constructor(private translate: TranslateService,
                private userService: UserService,
                private navController: NavController,
                private router: Router,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.ownsAccount = this.userService.user.uid === this.account.userId;
    }

    get balanceString(): string {
        return `€ ${getMoneyString(this.account.balance)}`;
    }

    openAccount() {
        const relativeRoute = this.router.createUrlTree(['accounts', this.account.id], {
            relativeTo: this.route
        });

        this.navController.navigateForward(relativeRoute);
    }
}
