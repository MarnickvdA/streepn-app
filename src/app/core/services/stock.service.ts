import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Group, Stock, stockConverter} from '../models';
import {newStock} from '../models/stock';
import {AuthService} from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class StockService {

    constructor(private functions: AngularFireFunctions,
                private fs: AngularFirestore,
                private authService: AuthService) {
    }

    addStockItem(group: Group, productId: string, cost: number, amount: number, paidBy: string[], paidAmount: number[]): Observable<Stock> {
        const currentAccount = group.accounts.find(acc => this.authService.currentUser.uid === acc.userId);
        const stock = new Stock('', undefined, currentAccount.id, paidBy, paidAmount, productId, cost, amount, false, false);

        const callable = this.functions.httpsCallable('addStock');
        return callable({
            groupId: group.id,
            stock
        }).pipe(
            map(result => {
                return newStock(result.id, result);
            }));
    }

    removeStockItem(group: Group, productId: string, amount: number) {
        const currentAccount = group.accounts.find(acc => this.authService.currentUser.uid === acc.userId);
        const currentProduct = group.products.find(p => p.id === productId);

        if (isNaN(currentProduct.stock)) {
            currentProduct.stock = 0;
        }
        const stock = new Stock('', undefined, currentAccount.id, undefined, undefined, productId,
            undefined, amount, false, true);

        const callable = this.functions.httpsCallable('removeStock');
        return callable({
            groupId: group.id,
            stock,
        }).pipe(
            map(result => {
                return newStock(result.id, result);
            }));
    }

    editStockItem(group: Group, original: Stock, productId: string, cost: number, amount: number,
                  paidBy: string[], paidAmount: number[]): Observable<Stock> {

        const currentAccount = group.accounts.find(acc => this.authService.currentUser.uid === acc.userId);
        const updatedStock = new Stock(original.id, original.createdAt, currentAccount.id, paidBy, paidAmount,
            productId, cost, amount, false, false);

        const deltaPaidBy: string[] = [];
        const deltaPaidAmount: number[] = [];
        for (let i = 0; i < original.paidBy.length; i++) {
            const accountId = original.paidBy[i];
            const newIndex = paidBy.indexOf(accountId);

            deltaPaidBy.push(accountId);
            deltaPaidAmount.push((newIndex >= 0 ? paidAmount[newIndex] : 0) - original.paidAmount[i]);
        }

        paidBy.filter(accId => !original.paidBy.includes(accId)).forEach(id => {
            deltaPaidBy.push(id);
            deltaPaidAmount.push(paidAmount[paidBy.indexOf(id)]);
        });

        const deltaStock = new Stock(original.id, original.createdAt, currentAccount.id, deltaPaidBy, deltaPaidAmount,
            original.productId, cost - original.cost, amount - original.amount, false, false);

        const callable = this.functions.httpsCallable('editStock');
        return callable({
            groupId: group.id,
            deltaStock,
            updatedStock
        });
    }

    getStockItem(groupId: string, stockId: string): Promise<Stock> {
        return this.fs.collection('groups').doc(groupId).collection('stock').doc(stockId)
            .ref
            .withConverter(stockConverter)
            .get()
            .then((stock) => {
                return stock.data();
            });
    }
}
