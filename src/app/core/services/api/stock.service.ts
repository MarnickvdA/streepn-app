import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {House, Stock, stockConverter} from '../../models';
import {newStock} from '../../models/stock';
import {AuthService} from '@core/services';
import {doc, Firestore, getDoc} from '@angular/fire/firestore';
import {Functions, httpsCallable} from '@angular/fire/functions';
import {Performance, trace} from '@angular/fire/performance';

@Injectable({
    providedIn: 'root'
})
export class StockService {

    constructor(private functions: Functions,
                private firestore: Firestore,
                private performance: Performance,
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

        httpsCallable(this.functions, 'addStock').call({
            houseId: house.id,
            stock
        }).pipe(
            trace(this.performance, 'addStock'),
            map((result: any) => newStock(result.id, result))
        );
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

        httpsCallable(this.functions, 'removeStock').call({
            houseId: house.id,
            stock,
        }).pipe(
            trace(this.performance, 'removeStock'),
            map((result: any) => newStock(result.id, result))
        );
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

        httpsCallable(this.functions, 'editStock').call({
            houseId: house.id,
            updatedStock
        }).pipe(
            trace(this.performance, 'editStock'),
        );
    }

    getStockItem(houseId: string, stockId: string): Promise<Stock> {
        const stockRef = doc(this.firestore, `houses/${houseId}/stock/${stockId}`).withConverter(stockConverter);
        return getDoc(stockRef).then((stock) => stock.data());
    }
}
