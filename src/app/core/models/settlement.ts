import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';

export interface SettleItem {
    settle: number;
    owes: {
        [accountId: string]: number,
    };
    receives: {
        [accountId: string]: number,
    };
}

export class Settlement {
    readonly id: string;
    createdAt: Timestamp;
    createdBy: string;
    items: {
        [accountId: string]: SettleItem
    };
    accounts: {
        [accountId: string]: {
            name: string,
        }
    };

    constructor(id: string, createdAt: Timestamp, createdBy: string, items: { [p: string]: SettleItem },
                accounts: { [p: string]: { name: string } }) {
        this.id = id;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.items = items;
        this.accounts = accounts;
    }

    get createdByName(): string {
        return this.accounts[this.createdBy].name;
    }

    owes(accountId: string): { name: string, amount: number }[] {
        const owes: { name: string, amount: number }[] = [];
        Object.keys(this.items[accountId].owes)
            .forEach((oweId) => {
                owes.push({
                    name: this.accounts[oweId].name,
                    amount: this.items[accountId].owes[oweId]
                });
            });

        return owes;
    }

    receives(accountId: string): { name: string, amount: number }[] {
        const receives: { name: string, amount: number }[] = [];
        Object.keys(this.items[accountId].receives)
            .forEach((receiveId) => {
                receives.push({
                    name: this.accounts[receiveId].name,
                    amount: this.items[accountId].receives[receiveId]
                });
            });

        return receives;
    }
}

export const settlementConverter: FirestoreDataConverter<Settlement> = {
    toFirestore(settlement: Settlement) {
        return {
            createdAt: settlement.createdAt,
            createdBy: settlement.createdBy,
            accounts: settlement.accounts,
        };
    },
    fromFirestore(snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Settlement {
        const data = snapshot.data(options);
        return newSettlement(snapshot.id, data);
    },
};

export function newSettlement(id: string, data: { [key: string]: any }): Settlement {
    return new Settlement(id, data.createdAt as Timestamp, data.createdBy,
        JSON.parse(JSON.stringify(data.items)), data.accounts);
}
