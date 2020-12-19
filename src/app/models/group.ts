import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {Product, productConverter} from './product';
import {SharedAccount, sharedAccountConverter} from './shared-account';
import {Account, accountConverter} from './account';

export class Group {
    readonly id: string;
    readonly createdAt: Timestamp;
    name: string;
    valuta: string;
    inviteLink: string;
    inviteLinkExpiry: Timestamp;
    members: string[];
    accounts: Account[];
    products: Product[];
    sharedAccounts: SharedAccount[];


    constructor(id: string,
                createdAt: Timestamp,
                name: string,
                valuta: string,
                inviteLink: string,
                inviteLinkExpiry: Timestamp,
                members: string[],
                accounts: Account[],
                products: Product[],
                sharedAccounts: SharedAccount[]) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.valuta = valuta;
        this.inviteLink = inviteLink;
        this.inviteLinkExpiry = inviteLinkExpiry;
        this.members = members;
        this.accounts = accounts;
        this.products = products;
        this.sharedAccounts = sharedAccounts;
    }
}

export const groupConverter: FirestoreDataConverter<Group> = {
    toFirestore(group: Group) {
        return {
            name: group.name,
            valuta: group.valuta,
            inviteLink: group.inviteLink,
            inviteLinkExpiry: group.inviteLinkExpiry,
            members: group.members,
            accounts: group.accounts.map((account) => accountConverter.toFirestore(account)),
            products: group.products.map((product) => productConverter.toFirestore(product)),
            sharedAccounts: group.sharedAccounts.map((sharedAccount) => sharedAccountConverter.toFirestore(sharedAccount)),
        };
    },
    fromFirestore(snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Group {
        const data = snapshot.data(options);

        const accounts = [];
        data.accounts.forEach((account, index) => accounts.push(accountConverter.newAccount(index, account)));
        const products = [];
        data.accounts.forEach((product, index) => products.push(productConverter.newProduct(index, product)));
        const sharedAccounts = [];
        data.accounts.forEach((sharedAccount, index) => sharedAccounts.push(sharedAccountConverter.newSharedAccount(index, sharedAccount)));

        return new Group(snapshot.id, data.createdAt, data.name, data.valuta, data.inviteLink,
            data.inviteLinkExpiry, data.members, accounts, products, sharedAccounts);
    }
};
