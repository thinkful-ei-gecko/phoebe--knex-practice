require('dotenv').config();
const knex = require('knex');

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL,
})

function getTextItems(searchTerm) {
  knexInstance
    .select('name', 'category')
    .from('shopping_list')
    .where('name', 'ILIKE', `%${searchTerm}%`)
    .then(result => {
      console.log(result);
    });
  //query shopping_list
  //select rows w/ name that has search
}

getTextItems('lettuce');

function getPaginatedItems(page) {
  const numberOfItemsPerPg = 6;
  const offset = 6 * (page - 1);

  knexInstance
    .select('name', 'price', 'category')
    .from('shopping_list')
    .limit(numberOfItemsPerPg)
    .offset(offset)
    .then(result => {
      console.log(result);
    });
}

getPaginatedItems(1);

function getItemsAddedAfterDate(daysAgo) {

  knexInstance
    .select('name', 'price', 'date_added', 'category')
    .from('shopping_list')
    .where(
      'date_added',
      '>',
      knexInstance.raw(`now() -'?? days'::INTERVAL`, daysAgo)
      )
    .then(result => {
      console.log(`Items added since ${days} ago`);
      console.log(result);
    });
}

getItemsAddedAfterDate(5);

function getTotalCostByCategory() {
  knexInstance
    .select('category')
    .sum('price as total')
    .from('shopping_list')
    .groupBy('category')
    .then(result => {
      console.log(result);
    });   
}

getTotalCostByCategory();