export class SharedAccount {
    constructor(id, createdAt, name, balance, accounts) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.balance = balance;
        this.accounts = accounts;
    }
}
export const sharedAccountConverter = {
    toFirestore(sharedAccount) {
        return {
            createdAt: sharedAccount.createdAt,
            name: sharedAccount.name,
            balance: sharedAccount.balance,
            accounts: sharedAccount.accounts
        };
    },
    newSharedAccount(id, ...data) {
        return new SharedAccount(id, data.createdAt.toDate(), data.name, data.balance, data.accounts);
    }
};
//# sourceMappingURL=shared-account.js.map