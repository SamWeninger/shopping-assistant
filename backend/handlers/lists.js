// handlers/lists.js
const { docClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand } = require('../utils/dynamodb');
const { v4: uuidv4 } = require('uuid');

const MAX_ALLOWED_USERS = 10; // Set an appropriate maximum number of allowed users

// TODO: Auth
async function createShoppingList(listName, createdBy, allowedUsers = []) {
  // Ensure unique users and include the creator
  const safeAllowedUsers = Array.isArray(allowedUsers) ? allowedUsers : [];
  const uniqueUsers = Array.from(new Set([createdBy, ...safeAllowedUsers]));

  if (uniqueUsers.length > MAX_ALLOWED_USERS) {
    throw new Error(`Cannot have more than ${MAX_ALLOWED_USERS} users in a list`);
  }

  // Validate list name
  if (!listName || listName.trim() === '') {
    throw new Error("List name cannot be empty");
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

  if (!result.Item) {
    throw new Error("Shopping list not found");
  }

  if (!result.Item.AllowedUsers.includes(requestingUserId)) {
    throw new Error("Unauthorized access to the shopping list");
  }

  return result.Item;
}

async function addItemToList(listId, itemName, quantity = 1, addedBy) {
  // Validate item name
  if (!itemName || itemName.trim() === '') {
    throw new Error("Item name cannot be empty");
  }

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

async function addUserToList(listId, requestingUserId, userId) {
  const list = await getShoppingList(listId, requestingUserId);

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

async function removeUserFromList(listId, requestingUserId, userId) {
  const list = await getShoppingList(listId, requestingUserId);

  // Check if the requesting user is authorized to remove users
  if (!list.AllowedUsers.includes(requestingUserId)) {
    throw new Error("Unauthorized: You do not have permission to modify this list");
  }

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

// TODO: handle quantity of items
async function markItemAsPurchased(listId, itemId, purchasedBy, cost = null, itemDetails = null) {
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

async function deleteShoppingList(listId, requestingUserId) {
  // First, retrieve the list to check the creator
  const listParams = {
    TableName: 'ShoppingLists',
    Key: { ListId: listId }
  };

  const listResult = await docClient.send(new GetCommand(listParams));

  if (!listResult.Item) {
    throw new Error("Shopping list not found");
  }

  if (listResult.Item.CreatedBy !== requestingUserId) {
    throw new Error("Unauthorized: Only the creator can delete this list");
  }

  // Retrieve all items associated with the list
  const itemsParams = {
    TableName: 'ShoppingListItems',
    KeyConditionExpression: 'ListId = :listId',
    ExpressionAttributeValues: {
      ':listId': listId
    }
  };

  const itemsResult = await docClient.send(new QueryCommand(itemsParams));

  // Delete each item
  for (const item of itemsResult.Items) {
    const deleteItemParams = {
      TableName: 'ShoppingListItems',
      Key: { ListId: item.ListId, ItemId: item.ItemId }
    };
    await docClient.send(new DeleteCommand(deleteItemParams));
  }

  // Delete the list
  await docClient.send(new DeleteCommand(listParams));
  return { message: 'List and all associated items deleted successfully' };
}

module.exports = {
  createShoppingList,
  getShoppingList,
  addItemToList,
  markItemAsPurchased,
  removeItemFromList,
  addUserToList,
  removeUserFromList,
  deleteShoppingList
};
