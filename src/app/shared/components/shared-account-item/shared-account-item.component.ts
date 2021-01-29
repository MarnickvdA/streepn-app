import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Group, SharedAccount} from '@core/models';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {GroupService} from '@core/services';

@Component({
    selector: 'app-shared-account-item',
    templateUrl: './shared-account-item.component.html',
    styleUrls: ['./shared-account-item.component.scss'],
})
export class SharedAccountItemComponent implements OnInit, OnDestroy {

    @Input() account: SharedAccount;
    @Input() isButton = true;
    @Output() clicked: EventEmitter<any> = new EventEmitter();

    group?: Group;
    hasCallback: boolean;
    private groupSub: Subscription;

    constructor(private translate: TranslateService,
                private groupService: GroupService) {
    }

    ngOnInit() {
        this.groupSub = this.groupService.observeGroup(this.groupService.currentGroupId)
            .subscribe((group) => {
                this.group = group;
            });
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
    }

    onClick() {
        this.clicked.emit();
    }
}
