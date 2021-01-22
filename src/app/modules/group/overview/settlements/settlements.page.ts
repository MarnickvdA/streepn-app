import {Component, OnDestroy, OnInit} from '@angular/core';
import {Group} from '@core/models';
import {AuthService, GroupService, LoggerService, PushService, StorageService} from '@core/services';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faCalculatorAlt} from '@fortawesome/pro-duotone-svg-icons';

@Component({
    selector: 'app-settlements',
    templateUrl: './settlements.page.html',
    styleUrls: ['./settlements.page.scss'],
})
export class SettlementsPage implements OnInit, OnDestroy {
    groupId: string;
    group: Group;

    private readonly logger = LoggerService.getLogger(SettlementsPage.name);
    private groupSub: Subscription;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private groupService: GroupService,
                private authService: AuthService,
                private pushService: PushService,
                private storage: StorageService,
                private iconLibary: FaIconLibrary) {
        this.iconLibary.addIcons(faCalculatorAlt);
    }

    ngOnInit() {
        this.groupId = this.groupService.currentGroupId;
        this.groupSub = this.groupService.observeGroup(this.groupId)
            .subscribe(group => {
                this.group = group;
            });
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
    }

    settleGroup() {
    }
}
