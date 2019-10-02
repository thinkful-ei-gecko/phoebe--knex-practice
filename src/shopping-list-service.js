//get insert update delete shopping list items 

// make a test too 

const ShoppingListService = {
  getShoppingList(knex) {
    return knex.select('*').from('shopping_list');
  }, 
  getById(knex, id) {
    return knex
      .select('*')
      .from('shopping_list')
      .where('id', id)
      .first();
  },
  insertItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into('shopping_list')
      .returning('*')
      .then(row => {
        return row[0];
      });
  }, 
  updateItem(knex, id, updatedData) {
    return knex('shopping_list')
      .where({ id })
      .update(updatedData);
  },
  deleteById(knex, id) {
    return knex('shopping_list')
      .where({ id })
      .delete()
  }
}

module.exports = ShoppingListService;