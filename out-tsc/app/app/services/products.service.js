import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import firebase from 'firebase';
let ProductsService = class ProductsService {
    constructor(firestoreService) {
        this.firestoreService = firestoreService;
    }
    addProduct(groupId, product) {
        this.firestoreService.groupsCollection.doc(groupId).update({
            products: firebase.firestore.FieldValue.arrayUnion(product)
        });
    }
    removeProduct(groupId, product) {
        this.firestoreService.groupsCollection.doc(groupId).update({
            products: firebase.firestore.FieldValue.arrayRemove(product)
        });
    }
};
ProductsService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], ProductsService);
export { ProductsService };
//# sourceMappingURL=products.service.js.map