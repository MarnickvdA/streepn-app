export class Product {
    constructor(id, createdAt, name, price) {
        this.id = id;
        this.createdAt = createdAt;
        this.name = name;
        this.price = price;
    }
}
export const productConverter = {
    toFirestore(product) {
        return {
            createdAt: product.createdAt,
            name: product.name,
            price: product.price
        };
    },
    newProduct(id, ...data) {
        return new Product(id, data.createdAt.toDate(), data.name, data.price);
    }
};
//# sourceMappingURL=product.js.map