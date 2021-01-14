import {Component, OnInit} from '@angular/core';
import {GroupService} from '@core/services';
import {Observable} from 'rxjs';
import {Group} from '@core/models';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faMinusCircle, faPlusCircle} from '@fortawesome/pro-duotone-svg-icons';

@Component({
    selector: 'app-group-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

    group$: Observable<Group>;

    constructor(private groupService: GroupService,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faPlusCircle, faMinusCircle);
    }

    ngOnInit() {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);
    }

}
