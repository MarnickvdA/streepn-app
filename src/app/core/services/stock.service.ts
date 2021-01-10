import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Account, Group, Stock, stockConverter} from '../models';
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

    addStockItem(group: Group, productId: string, cost: number, amount: number, paidBy: Account[], payout: number[]): Observable<Stock> {
        const currentAccount = group.accounts.find(acc => this.authService.currentUser.uid === acc.userId);
        const currentProduct = group.products.find(p => p.id === productId);
        if (isNaN(currentProduct.stock)) {
            currentProduct.stock = 0;
        }
        const stock = new Stock('', undefined, currentAccount, paidBy, currentProduct, cost, amount, false);

        const callable = this.functions.httpsCallable('addStock');
        return callable({
            groupId: group.id,
            stock,
            payout,
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
        const stock = new Stock('', undefined, currentAccount, undefined, currentProduct, undefined, amount, true);

        const callable = this.functions.httpsCallable('removeStock');
        return callable({
            groupId: group.id,
            stock,
        }).pipe(
            map(result => {
                return newStock(result.id, result);
            }));
    }

    editStockItem(groupId: string, deltaStock: Stock, updatedStock: Stock): Observable<Stock> {
        const callable = this.functions.httpsCallable('editStock');
        return callable({
            groupId,
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
