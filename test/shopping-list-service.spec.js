require('dotenv').config();
const { expect } = require('chai');
const supertest = require('supertest');
const knex = require('knex');

const ShoppingListService = require('../src/shopping-list-service');

describe('Shopping List Service', () => {
  
  let db;
  const testShoppingList = [
    {
      name: 'Pistachios', 
      price: '8.99', 
      category: 'Snack', 
      checked: true,
      date_added: new Date('2019-10-02T07:00:00.000Z'),
      id: 1
    }, 
    {
      name: 'Apple', 
      price: '0.89', 
      category: 'Snack', 
      checked: false,
      date_added: new Date('2019-10-02T07:00:00.000Z'),
      id: 2
    }, 
    {
      name: 'Cheese-Itz', 
      price: '4.50', 
      category: 'Snack', 
      checked: true,
      date_added: new Date('2019-10-02T07:00:00.000Z'),
      id: 3
    }
  ];


  //Before the tests, start a connection to the test database
  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
  });

  //before the tests, remove any existing data from our 'shopping_list' table
  before(() => db('shopping_list').truncate());
  //after each test, refresh the table (remove existing data from our 'shopping_list' table) in the test db
  afterEach(() => db('shopping_list').truncate());
  //after all tests, end the connection to the test db
  after(() => db.destroy());

  context('Given "shopping_list" has data', () => {
    //since this context is give that the table has data, but we're also truncating the array after each run, let's make a beforeEach() method that populates the array before each test
    beforeEach(() => {
      return db
        .into('shopping_list')
        .insert(testShoppingList);
    });

    it('getShoppingList() resolves all items from "shopping_list" table', () => {
      return ShoppingListService.getShoppingList(db)
        //the result should match the array
        .then(actual => {
          expect(actual).to.be.eql(testShoppingList)
        });
    });

    it('getById() resolves an item by id from "shopping_list" table', () => {
      const itemId = 3;
      const itemIndexedById = testShoppingList[itemId - 1];
      return ShoppingListService.getById(db, itemId)
        .then(actual => {
          //you've got to spell this out so it's a deep copy? idrk
          expect(actual).to.eql({
            name: itemIndexedById.name,
            price: itemIndexedById.price,
            category: itemIndexedById.category,
            checked: itemIndexedById.checked,
            date_added: new Date(itemIndexedById.date_added), 
            id: itemId,
          });
        });
    })

    //no insert is practiced here as it really only needs to be checked on one of two, which makes more sense for it to be added to the context without data

    it('updateItem() updates an item from "shopping_list" table', () => {
      const itemId = 2;
      const updatedItemData = {
        name: 'Organic Apple', 
        price: '100.00'
      }
      const originalItemData = testShoppingList[itemId - 1]
      return ShoppingListService.updateItem(db, itemId, updatedItemData)
        .then(() => ShoppingListService.getById(db, itemId))
        .then(actual => {
          expect(actual).to.be.eql({
            checked: originalItemData.checked,
            date_added: originalItemData.date_added,
            category: originalItemData.category,
            id: originalItemData.id,
            ...updatedItemData
          })
        })
    })

    it('deleteById() removes an item from the "shopping_list" table', () => {
      const itemId = 1;
      const newTestShoppingList = testShoppingList;
      //remove item from array (splice returns the spliced object, not the new array value)
      newTestShoppingList.splice((itemId - 1), 1)

      return ShoppingListService.deleteById(db, itemId)
        .then(() => ShoppingListService.getShoppingList(db))
        .then(actual => {
            expect(actual).to.be.eql(newTestShoppingList)
          });
    });

  })

  context('Given "shopping_list" has no data', () => {
    it('getShoppingList() returns an empty array', () => {
      return ShoppingListService.getShoppingList(db)
        .then(actual => {
          expect(actual).to.be.eql([]);
        });
    })

    it('insertItem() inserts a new item and resolves the item with an id', () => {
      const newItem = {
        name: 'Superfood Powder',
        price: '9.99', 
        category: 'Snack',
        checked: true,
        date_added: new Date('2019-10-02T07:00:00.000Z')
      }
      return ShoppingListService.insertItem(db, newItem)
        .then(actual => {
          expect(actual).to.be.eql({
            id: 1,
            ...newItem
          });
        });
    });

    //nothing for the "getById here" - not sure how you'd test that

    //nothing for "updateItem" here - nothing to update (you could if you wanted, but just need to check i guess )

  })

});