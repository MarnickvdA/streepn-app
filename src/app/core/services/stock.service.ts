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

    addStockItem(group: Group, productId: string, cost: number, amount: number, paidById: string): Observable<Stock> {
        const currentAccount = group.getUserAccountByUserId(this.authService.currentUser.uid);
        const stock = Stock.new(currentAccount.id, paidById, productId, cost, amount);

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
        const currentAccount = group.getUserAccountByUserId(this.authService.currentUser.uid);

        const stock = new Stock('', undefined, currentAccount.id, undefined, productId,
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
                  paidById: string): Observable<Stock> {

        const currentAccount = group.getUserAccountByUserId(this.authService.currentUser.uid);

        const updatedStock = new Stock(original.id, original.createdAt, currentAccount.id, paidById,
            productId, cost, amount, false, false);

        const deltaStock = new Stock(original.id, original.createdAt, currentAccount.id, original.paidById, original.productId,
            original.paidById !== paidById ? -original.cost : cost - original.cost,
            original.productId !== productId ? -original.amount : amount - original.amount, false, false);

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
