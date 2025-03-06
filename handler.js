'use strict';

const { createShoppingList, getShoppingList, addItemToList, removeItemFromList, addUserToList, removeUserFromList, markItemAsPurchased, deleteShoppingList } = require('./handlers/lists');
const { generateReceiptUploadURL } = require('./handlers/receipts');

// Handler for creating a shopping list
exports.createShoppingListHandler = async (event) => {
  const { listName, createdBy, allowedUsers } = JSON.parse(event.body);
  const createdList = await createShoppingList(listName, createdBy, allowedUsers);
  return { statusCode: 200, body: JSON.stringify(createdList) };
};

// Handler for getting a shopping list
exports.getShoppingListHandler = async (event) => {
  const listId = event.pathParameters.listId;
  const requestingUserId = event.queryStringParameters.requestingUserId;
  try {
    const list = await getShoppingList(listId, requestingUserId);
    return { statusCode: 200, body: JSON.stringify(list) };
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
  }
};

// Handler for adding an item to a list
exports.addItemToListHandler = async (event) => {
  const listId = event.pathParameters.listId;
  const { itemName, quantity, addedBy } = JSON.parse(event.body);
  const item = await addItemToList(listId, itemName, quantity, addedBy);
  return { statusCode: 200, body: JSON.stringify(item) };
};

// Handler for removing an item from a list
exports.removeItemFromListHandler = async (event) => {
  const listId = event.pathParameters.listId;
  const itemId = event.pathParameters.itemId;
  const response = await removeItemFromList(listId, itemId);
  return { statusCode: 200, body: JSON.stringify(response) };
};

// Handler for adding a user to a list
exports.addUserToListHandler = async (event) => {
  const listId = event.pathParameters.listId;
  const { userId } = JSON.parse(event.body);
  const response = await addUserToList(listId, userId);
  return { statusCode: 200, body: JSON.stringify(response) };
};

// Handler for removing a user from a list
exports.removeUserFromListHandler = async (event) => {
  const listId = event.pathParameters.listId;
  const userId = event.pathParameters.userId;
  const response = await removeUserFromList(listId, userId);
  return { statusCode: 200, body: JSON.stringify(response) };
};

// Handler for marking an item as purchased
exports.markItemAsPurchasedHandler = async (event) => {
  const listId = event.pathParameters.listId;
  const itemId = event.pathParameters.itemId;
  const { purchasedBy, cost, itemDetails } = JSON.parse(event.body);
  const response = await markItemAsPurchased(listId, itemId, purchasedBy, cost, itemDetails);
  return { statusCode: 200, body: JSON.stringify(response) };
};

// Handler for deleting a shopping list
exports.deleteShoppingListHandler = async (event) => {
  const listId = event.pathParameters.listId;
  const { requestingUserId } = JSON.parse(event.body);
  const response = await deleteShoppingList(listId, requestingUserId);
  return { statusCode: 200, body: JSON.stringify(response) };
};

// Handler for generating a receipt upload URL
exports.generateReceiptUploadURLHandler = async (event) => {
  const { listId, uploadedBy } = JSON.parse(event.body);
  const response = await generateReceiptUploadURL(listId, uploadedBy);
  return { statusCode: 200, body: JSON.stringify(response) };
};
