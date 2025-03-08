const {
  createShoppingList,
  getShoppingList,
  addItemToList,
  removeItemFromList,
  addUserToList,
  removeUserFromList,
  markItemAsPurchased,
  deleteShoppingList
} = require('./lists');

const { generateReceiptUploadURL } = require('./receipts');

(async () => {
  const userId = 'user123';
  const familyMembers = ['user456', 'user789', 'user123']; // Intentional duplicate for testing

  try {
    // Test creating a shopping list with unique users
    const newList = await createShoppingList('Weekly Groceries', userId, familyMembers);
    console.log('Created List:', newList);

    // Test adding an item to the list
    const item = await addItemToList(newList.ListId, 'Eggs', 1, userId);
    console.log('Added Item:', item);

    // Test marking an item as purchased
    const purchasedItem = await markItemAsPurchased(newList.ListId, item.ItemId, userId, 2.99, { brand: 'BrandA', barcode: '123456789' });
    console.log('Marked Item as Purchased:', purchasedItem);

    // Test adding a user to the list
    const addUserResponse = await addUserToList(newList.ListId, userId, 'user456');
    console.log('Add User Response:', addUserResponse);

    // Test removing a user from the list
    const removeUserResponse = await removeUserFromList(newList.ListId, userId, 'user456');
    console.log('Remove User Response:', removeUserResponse);

    // Test removing an item from the list
    const removeItemResponse = await removeItemFromList(newList.ListId, item.ItemId);
    console.log('Remove Item Response:', removeItemResponse);

    // Test deleting the shopping list
    const deleteListResponse = await deleteShoppingList(newList.ListId, userId);
    console.log('Delete List Response:', deleteListResponse);

  } catch (error) {
    console.error('Test Error:', error);
  }
})();
