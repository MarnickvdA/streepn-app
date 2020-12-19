export class Account {
    constructor(id, userId, createdAt, name, balance, roles) {
        this.id = id;
        this.userId = userId;
        this.createdAt = createdAt;
        this.name = name;
        this.balance = balance;
        this.roles = roles;
    }
}
export const accountConverter = {
    toFirestore(account) {
        return {
            userId: account.userId,
            createdAt: account.createdAt,
            name: account.name,
            balance: account.balance,
            roles: account.roles
        };
    },
    newAccount(id, ...data) {
        return new Account(id, data.userId, data.createdAt.toDate(), data.name, data.balance, data.roles);
    }
};
//# sourceMappingURL=account.js.map