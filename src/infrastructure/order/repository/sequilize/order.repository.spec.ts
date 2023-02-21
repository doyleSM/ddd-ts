import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should return all orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address)
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const customer2 = new Customer("321", "Customer 2");
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
    customer2.changeAddress(address2)
    await customerRepository.create(customer2);

    const product2 = new Product("321", "Product 2", 30);
    await productRepository.create(product2);

    const ordemItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      3
    );

    const order2 = new Order("321", "321", [ordemItem2]);

    await orderRepository.create(order2);

    const res = await orderRepository.findAll()
    const orderModel = await OrderModel.findAll({ include: [{ model: OrderItemModel }] });

    expect(res.length).toEqual(2)
    expect(res).toStrictEqual(orderModel.map((order) => {
      return new Order(order.id, order.customer_id, order.items.map((item) => {
        return new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
      }))
    }))
  })

  it("should return register correctly one order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address)
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const customer2 = new Customer("321", "Customer 2");
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
    customer2.changeAddress(address2)
    await customerRepository.create(customer2);

    const product2 = new Product("321", "Product 2", 30);
    await productRepository.create(product2);

    const ordemItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      3
    );

    const order2 = new Order("321", "321", [ordemItem2]);

    await orderRepository.create(order2);

    const res1 = await orderRepository.find("123")
    const orderModel1 = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    const res2 = await orderRepository.find("321")
    const orderModel2 = await OrderModel.findOne({
      where: { id: order2.id },
      include: ["items"],
    });

    expect(res1).toEqual(
      {
        _customerId: "123",
        _id: "123",
        _items: [
          {
            _id: "1",
            _name: "Product 1",
            _price: 10,
            _productId: "123",
            _quantity: 2,
          }],
          _total: 20
      })
    expect(res2).toEqual({
      _customerId: "321",
      _id: "321",
      _items: [
        {
          _id: "2",
          _name: "Product 2",
          _price: 30,
          _productId: "321",
          _quantity: 3,
        }],
        _total: 90
    })
  })
})
