import {Component, OnInit} from '@angular/core';
import {GroupService} from '@core/services';
import {Observable} from 'rxjs';
import {Group} from '@core/models';

@Component({
    selector: 'app-group-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

    group$: Observable<Group>;

    constructor(private groupService: GroupService) {
    }

    ngOnInit() {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);
    }

}
