const {
  createShoppingList,
  getShoppingList,
  addItemToList,
  removeItemFromList,
  addUserToList,
  removeUserFromList,
  markItemAsPurchased
} = require('./lists');

const { generateReceiptUploadURL } = require('./receipts');

(async () => {
  const userId = 'user123';
  const familyMembers = ['user456', 'user789', 'user123']; // Intentional duplicate for testing
  const maxUsers = Array.from({ length: 10 }, (_, i) => `user${i + 1}`);

  try {
    // Test creating a shopping list with unique users
    const newList = await createShoppingList('Weekly Groceries', userId, familyMembers);
    console.log('Created List:', newList);

    // Test exceeding max allowed users
    try {
      await createShoppingList('Large Family List', userId, maxUsers);
    } catch (error) {
      console.log('Expected error for exceeding max users:', error.message);
    }

    // Test adding an item to the list
    const item = await addItemToList(newList.ListId, 'Eggs', 1, userId);
    console.log('Added Item:', item);

    // Test removing an item from the list
    const removeItemResponse = await removeItemFromList(newList.ListId, item.ItemId);
    console.log(removeItemResponse);

    // Test adding a user to the list
    const addUserResponse = await addUserToList(newList.ListId, 'user456');
    console.log('Add User Response:', addUserResponse);

    // Test adding an existing user
    const addExistingUserResponse = await addUserToList(newList.ListId, 'user456');
    console.log('Add Existing User Response:', addExistingUserResponse);

    // Test removing a user from the list
    const removeUserResponse = await removeUserFromList(newList.ListId, 'user456');
    console.log('Remove User Response:', removeUserResponse);

    // Test marking an item as purchased
    const purchasedItem = await markItemAsPurchased(newList.ListId, item.ItemId, userId, 2.99, { brand: 'BrandA', barcode: '123456789' });
    console.log('Marked Item as Purchased:', purchasedItem);

  } catch (error) {
    console.error('Test Error:', error);
  }
})();
