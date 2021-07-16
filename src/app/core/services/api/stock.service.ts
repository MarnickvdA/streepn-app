import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {House, Stock, stockConverter} from '../../models';
import {newStock} from '../../models/stock';
import {AuthService} from '../firebase/auth.service';
import {AngularFirePerformance, trace} from '@angular/fire/performance';

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
        const currentAccount = house.getUserAccountByUserId(this.authService.currentUser.uid);
        const stock = Stock.new(currentAccount.id, paidById, productId, cost, amount);

        const callable = this.functions.httpsCallable('addStock');
        return callable({
            houseId: house.id,
            stock
        }).pipe(
            trace('addStock'),
            map(result => {
                return newStock(result.id, result);
            }));
    }

    removeStockItem(house: House, productId: string, amount: number) {
        const currentAccount = house.getUserAccountByUserId(this.authService.currentUser.uid);

        const stock = new Stock('', undefined, currentAccount.id, undefined, productId,
            undefined, amount, false, true);

        const callable = this.functions.httpsCallable('removeStock');
        return callable({
            houseId: house.id,
            stock,
        }).pipe(
            trace('removeStock'),
            map(result => {
                return newStock(result.id, result);
            }));
    }

    editStockItem(house: House, original: Stock, productId: string, cost: number, amount: number,
                  paidById: string): Observable<Stock> {

        const currentAccount = house.getUserAccountByUserId(this.authService.currentUser.uid);

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
            .then((stock) => {
                return stock.data();
            });
    }
}
