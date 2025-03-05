// handlers/lists.js
const { docClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand } = require('../utils/dynamodb');
const { v4: uuidv4 } = require('uuid');

const MAX_ALLOWED_USERS = 10; // Set an appropriate maximum number of allowed users

async function createShoppingList(listName, createdBy, allowedUsers = []) {
  // Ensure unique users and include the creator
  const uniqueUsers = Array.from(new Set([createdBy, ...allowedUsers]));

  if (uniqueUsers.length > MAX_ALLOWED_USERS) {
    throw new Error(`Cannot have more than ${MAX_ALLOWED_USERS} users in a list`);
  }

  const item = {
    ListId: uuidv4(),
    ListName: listName,
    CreatedAt: Date.now(),
    CreatedBy: createdBy,
    AllowedUsers: uniqueUsers
  };

  await docClient.send(new PutCommand({
    TableName: 'ShoppingLists',
    Item: item
  }));

  return item;
}

async function getShoppingList(listId, requestingUserId) {
  const params = {
    TableName: 'ShoppingLists',
    Key: { ListId: listId }
  };

  const result = await docClient.send(new GetCommand(params));

  if (!result.Item || !result.Item.AllowedUsers.includes(requestingUserId)) {
    throw new Error("Unauthorized access to the shopping list");
  }

  return result.Item;
}

async function addItemToList(listId, itemName, quantity, addedBy) {
  const item = {
    ListId: listId,
    ItemId: uuidv4(),
    ItemName: itemName,
    Quantity: quantity,
    AddedBy: addedBy,
    AddedAt: new Date().toISOString(),
    Purchased: false
  };

  await docClient.send(new PutCommand({
    TableName: 'ShoppingListItems',
    Item: item
  }));

  return item;
}

async function removeItemFromList(listId, itemId) {
  const params = {
    TableName: 'ShoppingListItems',
    Key: { ListId: listId, ItemId: itemId }
  };

  await docClient.send(new DeleteCommand(params));
  return { message: 'Item removed successfully' };
}

async function addUserToList(listId, userId) {
  const list = await getShoppingList(listId, userId);

  if (list.AllowedUsers.includes(userId)) {
    return { message: 'User already exists in the list' };
  }

  if (list.AllowedUsers.length >= MAX_ALLOWED_USERS) {
    throw new Error(`Cannot add more than ${MAX_ALLOWED_USERS} users to the list`);
  }

  const updatedUsers = [...list.AllowedUsers, userId];

  const params = {
    TableName: 'ShoppingLists',
    Key: { ListId: listId },
    UpdateExpression: 'SET AllowedUsers = :users',
    ExpressionAttributeValues: {
      ':users': updatedUsers
    },
    ReturnValues: 'UPDATED_NEW'
  };

  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
}

async function removeUserFromList(listId, userId) {
  const list = await getShoppingList(listId, userId);

  if (!list.AllowedUsers.includes(userId)) {
    return { message: 'User does not exist in the list' };
  }

  const updatedUsers = list.AllowedUsers.filter(user => user !== userId);

  const params = {
    TableName: 'ShoppingLists',
    Key: { ListId: listId },
    UpdateExpression: 'SET AllowedUsers = :users',
    ExpressionAttributeValues: {
      ':users': updatedUsers
    },
    ReturnValues: 'UPDATED_NEW'
  };

  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
}

async function markItemAsPurchased(listId, itemId, purchasedBy, cost, itemDetails) {
  const params = {
    TableName: 'ShoppingListItems',
    Key: { ListId: listId, ItemId: itemId },
    UpdateExpression: 'SET Purchased = :p, PurchasedBy = :pb, PurchasedAt = :pa, Cost = :c, ItemDetails = :id',
    ExpressionAttributeValues: {
      ':p': true,
      ':pb': purchasedBy,
      ':pa': new Date().toISOString(),
      ':c': cost,
      ':id': itemDetails
    },
    ReturnValues: 'UPDATED_NEW'
  };

  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
}

module.exports = {
  createShoppingList,
  getShoppingList,
  addItemToList,
  markItemAsPurchased,
  removeItemFromList,
  addUserToList,
  removeUserFromList
};
