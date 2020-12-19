import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { groupConverter } from '../models';
let GroupService = class GroupService {
    constructor(firestoreService, functions, authService, eventsService) {
        this.firestoreService = firestoreService;
        this.functions = functions;
        this.authService = authService;
        this.eventsService = eventsService;
    }
    getGroups() {
        return this.authService.currentUser
            .then(user => {
            return this.firestoreService.groupsCollection
                .ref
                .where(`members`, 'array-contains', user.uid)
                .withConverter(groupConverter)
                .get()
                .then(querySnapshot => {
                const groups = [];
                querySnapshot.docs.forEach(doc => {
                    groups.push(doc.data());
                });
                return groups;
            });
        });
    }
    /**
     * Create a new group
     * @param name Name of group
     * @return newly created group's uid
     */
    createGroup(name) {
        return this.authService.currentUser
            .then(user => {
            const now = new Date();
            const nextWeek = new Date(Date.now() + 6.048e+8);
            const randomLink = 'ABC123XX';
            const group = {
                name,
                accounts: [{
                        name: user.displayName,
                        roles: ['ADMIN'],
                        userId: user.uid,
                        balance: 0,
                        createdAt: now
                    }],
                members: [user.uid],
                valuta: 'EUR',
                createdAt: now,
                inviteLink: randomLink,
                inviteLinkExpiry: nextWeek,
            };
            return this.firestoreService.groupsCollection
                .add(groupConverter.toFirestore(group))
                .then(docRef => {
                return docRef.id;
            })
                .catch(err => {
                this.eventsService.publish('http:error', err);
                return Promise.reject(err);
            });
        });
    }
    joinGroup(inviteLink) {
        const callable = this.functions.httpsCallable('join-group');
        callable({ inviteLink })
            .subscribe(data => {
            // TODO Get id for group back and go to the group page
        });
    }
};
GroupService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], GroupService);
export { GroupService };
//# sourceMappingURL=group.service.js.map