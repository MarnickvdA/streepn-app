import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/compat/functions';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {House, Stock, stockConverter} from '../../models';
import {newStock} from '../../models/stock';
import {AuthService} from '@core/services';
import {AngularFirePerformance, trace} from '@angular/fire/compat/performance';

@Injectable({
    providedIn: 'root'
})
export class StockService {

    constructor(private functions: AngularFireFunctions,
                private fs: AngularFirestore,
                private performance: AngularFirePerformance,
                private authService: AuthService) {
    }

    addStockItem(house: House, productId: string, cost: number, amount: number, paidById: string): Observable<Stock> {
        if (house.isSettling) {
            return throwError('addStock: House is settling');
        }

        const currentAccount = house.getUserAccountByUserId(this.authService.currentUser.uid);
        if (!currentAccount) {
            return throwError('addStock: User Account not found');
        }

        const stock = Stock.new(currentAccount.id, paidById, productId, cost, amount);

        const callable = this.functions.httpsCallable('addStock');
        return callable({
            houseId: house.id,
            stock
        }).pipe(
            trace('addStock'),
            map(result => newStock(result.id, result)));
    }

    removeStockItem(house: House, productId: string, amount: number) {
        if (house.isSettling) {
            return throwError('addStock: House is settling');
        }

        const currentAccount = house.getUserAccountByUserId(this.authService.currentUser.uid);
        if (!currentAccount) {
            return throwError('addStock: User Account not found');
        }

        const stock = new Stock('', undefined, currentAccount.id, undefined, productId,
            undefined, amount, false, true);

        const callable = this.functions.httpsCallable('removeStock');
        return callable({
            houseId: house.id,
            stock,
        }).pipe(
            trace('removeStock'),
            map(result => newStock(result.id, result)));
    }

    editStockItem(house: House, original: Stock, productId: string, cost: number, amount: number, paidById: string): Observable<Stock> {
        if (house.isSettling) {
            return throwError('addStock: House is settling');
        }

        const currentAccount = house.getUserAccountByUserId(this.authService.currentUser.uid);
        if (!currentAccount) {
            return throwError('addStock: User Account not found');
        }
        const updatedStock = new Stock(original.id, original.createdAt, currentAccount.id, paidById,
            productId, cost, amount, false, false);

        const callable = this.functions.httpsCallable('editStock');
        return callable({
            houseId: house.id,
            updatedStock
        }).pipe(
            trace('editStock'),
        );
    }

    getStockItem(houseId: string, stockId: string): Promise<Stock> {
        return this.fs.collection('houses').doc(houseId).collection('stock').doc(stockId)
            .ref
            .withConverter(stockConverter)
            .get()
            .then((stock) => stock.data());
    }
}
