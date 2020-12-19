import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
let FirestoreService = class FirestoreService {
    constructor(firestore) {
        this.firestore = firestore;
        this.BASE_URL = environment.baseUrl;
        this.groupsCollection = firestore.collection(`${this.BASE_URL}/groups`);
    }
};
FirestoreService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], FirestoreService);
export { FirestoreService };
//# sourceMappingURL=firestore.service.js.map