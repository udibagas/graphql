const typeDefs = `#graphql
  type Query {
    hello: String
    products: [Product]
    orders: [Order]
    order(id: String): Order
  }

  type User {
    _id: ID
    name: String
    email: String
    role: Role
  }

  type Product {
    _id: ID
    name: String
    price: Int
    stock: Int
  }

  scalar Date 

  type Order {
    _id: ID
    date: Date
    customerId: String
    productId: String
    customer: User
    product: Product
    qty: Int
    amount: Int
    status: PaymentStatus
    paidAt: Date
  }

  input OrderInput {
    productId: String!
    qty: Int!
    amount: Int!
  }

  input ProductInput {
    name: String!
    price: Int!
    stock: Int!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): User
    login(email: String!, password: String!): Token
    createProduct(data: ProductInput): Product
    createOrder(data: OrderInput!): Order
    payOrder(id: String): Order
  }

  type Token {
    token: String
  }

  enum PaymentStatus {
    paid
    unpaid
  }

  enum Role {
    customer
    seller
  }
`;

module.exports = typeDefs;
