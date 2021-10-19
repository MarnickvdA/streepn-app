import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {Balance} from '@core/models/balance';

export interface HouseSettleItem {
    settle: number;
    owes: {
        [accountId: string]: number;
    };
    receives: {
        [accountId: string]: number;
    };
}

export interface AccountPayout {
    totalOut: number;
    products: {
        [productId: string]: {
            totalOut: number;
            amountOut: number;
        };
    };
}

export interface AccountSettlement {
    [id: string]: AccountPayout;
}

export type SettlementType = 'house' | 'sharedAccount' | 'userAccount';

export abstract class Settlement {
    readonly id: string;
    createdAt: Timestamp;
    createdBy: string;
    type: SettlementType;
    accounts: {
        [accountId: string]: {
            name: string;
        };
    };

    protected constructor(id: string, createdAt: Timestamp, createdBy: string, type: SettlementType = 'house',
                          accounts: { [p: string]: { name: string } }) {
        this.id = id;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.type = type;
        this.accounts = accounts;
    }

    getAccountName(accountId: string): string {
        return this.accounts[accountId].name;
    }
}

export class HouseSettlement extends Settlement {

    items: {
        [accountId: string]: HouseSettleItem;
    };

    constructor(id: string, createdAt: Timestamp, createdBy: string, items: { [p: string]: HouseSettleItem },
                accounts: { [p: string]: { name: string } }) {
        super(id, createdAt, createdBy, 'house', accounts);

        this.items = items;
    }

    owes(accountId: string): { name: string; amount: number }[] {
        const owes: { name: string; amount: number }[] = [];
        Object.keys(this.items[accountId].owes)
            .forEach((oweId) => {
                owes.push({
                    name: this.accounts[oweId].name,
                    amount: this.items[accountId].owes[oweId]
                });
            });

        return owes;
    }

    receives(accountId: string): { name: string; amount: number }[] {
        const receives: { name: string; amount: number }[] = [];
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

export class SharedAccountSettlement extends Settlement {
    settledAtBefore: Timestamp;
    creditor: Balance;
    creditorId: string;
    debtors: {
        [id: string]: AccountPayout;
    };

    constructor(id: string, createdAt: Timestamp, createdBy: string, settledAtBefore: Timestamp, creditorId: string,
                creditor: Balance, debtors: { [p: string]: AccountPayout }, accounts: { [p: string]: { name: string } }) {
        super(id, createdAt, createdBy, 'sharedAccount', accounts);
        this.settledAtBefore = settledAtBefore;
        this.creditorId = creditorId;
        this.creditor = creditor;
        this.debtors = debtors;
    }
}

export class UserAccountSettlement extends Settlement {
    settledAtBefore: Timestamp;
    settlerAccountId: string;
    receiverAccountId: string;
    balanceSettled: Balance;

    constructor(id: string, createdAt: Timestamp, createdBy: string, accounts: { [p: string]: { name: string } },
                settledAtBefore: Timestamp, settlerAccountId: string, receiverAccountId: string, balanceSettled: Balance) {
        super(id, createdAt, createdBy, 'userAccount', accounts);
        this.settledAtBefore = settledAtBefore;
        this.settlerAccountId = settlerAccountId;
        this.receiverAccountId = receiverAccountId;
        this.balanceSettled = balanceSettled;
    }
}

export const settlementConverter: FirestoreDataConverter<Settlement> = {
    toFirestore: (settlement: Settlement) => ({}),
    fromFirestore: (snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Settlement => {
        const data = snapshot.data(options);

        switch (data.type) {
            case 'sharedAccount':
                return newSharedAccountSettlement(snapshot.id, data);
            case 'userAccount':
                return newUserAccountSettlement(snapshot.id, data);
            default:
                return newHouseSettlement(snapshot.id, data);
        }

    },
};

export const newHouseSettlement = (id: string, data: { [key: string]: any }): HouseSettlement => new HouseSettlement(id,
    data.createdAt as Timestamp, data.createdBy, JSON.parse(JSON.stringify(data.items)), data.accounts);

export const newSharedAccountSettlement
    = (id: string, data: { [key: string]: any }): SharedAccountSettlement => new SharedAccountSettlement(id, data.createdAt as Timestamp,
    data.createdBy, data.settledAtBefore as Timestamp, data.creditorId, JSON.parse(JSON.stringify(data.creditor)),
    JSON.parse(JSON.stringify(data.debtors)), data.accounts);

export const newUserAccountSettlement
    = (id: string, data: { [key: string]: any }): UserAccountSettlement => new UserAccountSettlement(id, data.createdAt as Timestamp,
    data.createdBy, data.accounts, data.settledAtBefore as Timestamp, data.settlerAccountId, data.receiverAccountId, data.balanceSettled);
