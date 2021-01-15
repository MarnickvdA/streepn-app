import {Component, OnDestroy, OnInit} from '@angular/core';
import {GroupService} from '@core/services';
import {Observable, Subscription} from 'rxjs';
import {Group} from '@core/models';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faMinusCircle, faPlusCircle} from '@fortawesome/pro-duotone-svg-icons';
import {AngularFirestore} from '@angular/fire/firestore';

@Component({
    selector: 'app-group-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

    group$: Observable<Group>;
    group?: Group;
    private groupSub: Subscription;

    constructor(private groupService: GroupService,
                private fs: AngularFirestore,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faPlusCircle, faMinusCircle);
    }

    ngOnInit() {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);
        this.groupSub = this.group$.subscribe((group) => {
            this.group = group;
        });
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
    }
}
