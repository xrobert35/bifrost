const request = require('supertest');
import { HttpStatus } from '@nestjs/common';
import { TestServer } from '../test-server';
import * as lodash from 'lodash';

import { default as adminAccount } from '../resources/account/admin';
import { Product } from '@shared/interface/product.int';

/**
 * Test route of ProductController
 */
describe('e2e - ProductController', () => {

  beforeAll(async () => {
    TestServer.getLogger().info('Starting test');
    try {
      await TestServer.bootstrap();
    } catch (err) {
      TestServer.getLogger().error('Starting test fail', err);
      throw new Error('Starting test fail');
    }
  });

  afterAll(async () => {
    await TestServer.getApplication().close();
  });

  let createdProduct: Product;

  it('should create product', async () => {
    createdProduct = {
      name: 'product_test',
    };

    const res = await request(TestServer.getHttpServer()).post('/api/product')
      .set('auth', JSON.stringify(adminAccount))
      .send(createdProduct);
    expect(res.status).toEqual(HttpStatus.CREATED);
    expect(res.body._id).toBeDefined();
    expect(res.body.reference).toBeDefined();
    expect(res.body.createdOn).toBeDefined();
    expect(res.body.name).toEqual(createdProduct.name);

    createdProduct = res.body;
  });

  it('should not create product with the same name', async () => {
    const newProduct = lodash.cloneDeep(createdProduct);
    delete newProduct._id;
    delete newProduct.reference;

    const res = await request(TestServer.getHttpServer()).post('/api/product')
      .set('auth', JSON.stringify(adminAccount))
      .send(newProduct);

    expect(res.status).toEqual(HttpStatus.CONFLICT);
    expect(res.body.code).toEqual('already_exist');
  });

  it('should modify product', async () => {
    createdProduct.name = 'testModifiy';
    const res = await request(TestServer.getHttpServer()).put(`/api/product/${createdProduct.reference}`)
      .set('auth', JSON.stringify(adminAccount))
      .send(createdProduct);

    expect(res.status).toEqual(HttpStatus.OK);
    expect(res.body._id).toEqual(createdProduct._id);
    expect(res.body.name).toEqual(createdProduct.name);
    expect(res.body.reference).toEqual(createdProduct.reference);
    expect(res.body.updatedOn).toBeDefined();

    createdProduct = res.body;
  });

  it('should get product', async () => {
    const res = await request(TestServer.getHttpServer()).get(`/api/product/${createdProduct.reference}`)
      .set('auth', JSON.stringify(adminAccount));

    expect(res.status).toEqual(HttpStatus.OK);
    expect(res.body._id).toEqual(createdProduct._id);
    expect(res.body.name).toEqual(createdProduct.name);
    expect(res.body.reference).toEqual(createdProduct.reference);
    expect(res.body.updatedOn).toEqual(createdProduct.updatedOn);
    expect(res.body.createdOn).toEqual(createdProduct.createdOn);
  });

  it('should not found product', async () => {
    const res = await request(TestServer.getHttpServer()).get(`/api/product/fakeId`)
      .set('auth', JSON.stringify(adminAccount));

    expect(res.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('should liste product', async () => {
    const res = await request(TestServer.getHttpServer()).get(`/api/product/list`)
      .set('auth', JSON.stringify(adminAccount));

    expect(res.status).toEqual(HttpStatus.OK);
    expect(res.body.length).toEqual(1);
  });

  it('should delete product', async () => {
    await request(TestServer.getHttpServer()).delete(`/api/product/${createdProduct.reference}`)
      .set('auth', JSON.stringify(adminAccount));

    const res = await request(TestServer.getHttpServer()).get(`/api/product/${createdProduct.reference}`)
      .set('auth', JSON.stringify(adminAccount));

    expect(res.status).toEqual(HttpStatus.NOT_FOUND);
  });
});
