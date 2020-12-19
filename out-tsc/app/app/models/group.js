import { accountConverter, productConverter, sharedAccountConverter } from './index';
export class Group {
    constructor(id, createdAt, name, valuta, inviteLink, inviteLinkExpiry, members, accounts, products, sharedAccounts) {
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
export const groupConverter = {
    toFirestore(group) {
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
    fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        const accounts = data.accounts.map((account, index) => accountConverter.newAccount(index, account));
        const products = data.accounts.map((product, index) => productConverter.newProduct(index, product));
        const sharedAccounts = data.accounts.map((sharedAccount, index) => sharedAccountConverter.newSharedAccount(index, sharedAccount));
        return new Group(snapshot.id, data.createdAt.toDate(), data.name, data.valuta, data.inviteLink, data.inviteLinkExpiry, data.members, accounts, products, sharedAccounts);
    }
};
//# sourceMappingURL=group.js.map