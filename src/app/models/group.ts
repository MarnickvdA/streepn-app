import {FirestoreDataConverter, Timestamp} from '@firebase/firestore-types';
import {DocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {Product, productConverter} from './product';
import {SharedAccount, sharedAccountConverter, UserAccount, userAccountConverter} from './account';

export class Group {
    readonly id: string;
    createdAt: Timestamp;
    name: string;
    valuta: string;
    inviteLink: string;
    inviteLinkExpiry: Timestamp;
    members: string[];
    accounts: UserAccount[];
    products: Product[];
    sharedAccounts: SharedAccount[];

    constructor(id: string,
                createdAt: Timestamp,
                name: string,
                valuta: string,
                inviteLink: string,
                inviteLinkExpiry: Timestamp,
                members: string[],
                accounts: UserAccount[],
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
        const accounts = [];
        const products = [];
        const sharedAccounts = [];

        group.accounts?.forEach((account) => accounts.push(userAccountConverter.toFirestore(account)));
        group.products?.forEach((product) => products.push(productConverter.toFirestore(product)));
        group.sharedAccounts?.forEach((sharedAccount) => sharedAccounts.push(sharedAccountConverter.toFirestore(sharedAccount)));

        return {
            createdAt: group.createdAt,
            name: group.name,
            valuta: group.valuta,
            inviteLink: group.inviteLink,
            inviteLinkExpiry: group.inviteLinkExpiry,
            members: group.members,
            accounts,
            products,
            sharedAccounts,
        };
    },
    fromFirestore(snapshot: DocumentSnapshot<any>, options: SnapshotOptions): Group {
        const data = snapshot.data(options);

        return newGroup(snapshot.id, data);
    }
};

export function newGroup(id: string, data: { [key: string]: any }): Group {
    const accounts = [];
    const products = [];
    const sharedAccounts = [];

    data.accounts?.forEach((account) => accounts.push(userAccountConverter.newAccount(account)));
    data.products?.forEach((product) => products.push(productConverter.newProduct(product)));
    data.sharedAccounts?.forEach((sharedAccount) =>
        sharedAccounts.push(sharedAccountConverter.newSharedAccount(sharedAccount)));

    return new Group(id, data.createdAt, data.name, data.valuta, data.inviteLink,
        data.inviteLinkExpiry, data.members, accounts, products, sharedAccounts);
}
