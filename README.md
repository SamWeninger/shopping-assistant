# Shopping Assistant Backend

The Shopping Assistant Backend is a Node.js application designed to facilitate shared shopping experiences for households. It allows users to create and manage shopping lists, add and remove items, track purchases, and upload receipts for verification and price tracking.

## Features

- **Shared Shopping Lists**: Create and manage shopping lists with multiple users.
- **Item Management**: Add, remove, and mark items as purchased.
- **User Management**: Add or remove users from shopping lists.
- **Receipt Upload**: Generate pre-signed URLs for uploading receipts to Amazon S3.
- **Purchase Tracking**: Track item purchases with detailed metadata.

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **AWS SDK**: Interact with AWS services like DynamoDB and S3.
- **DynamoDB**: NoSQL database for storing shopping lists and items.
- **S3**: Object storage for uploading and storing receipts.
- **UUID**: Generate unique identifiers for lists and items.
- **Dotenv**: Load environment variables from a `.env` file.

## Prerequisites

- **Node.js**: Ensure Node.js is installed on your machine.
- **AWS Account**: Required for accessing DynamoDB and S3 services.
- **Git**: Version control system for managing the project.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/shopping-assistant-backend.git
   cd shopping-assistant-backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your AWS credentials and configuration:
   ```plaintext
   AWS_REGION=us-east-2
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_S3_BUCKET=your-s3-bucket-name
   ```

4. **Run the Application**:
   ```bash
   node handlers/test.js
   ```

## Usage

- **Create a Shopping List**: Use the `createShoppingList` function to initialize a new list.
- **Manage Items**: Add or remove items using `addItemToList` and `removeItemFromList`.
- **Manage Users**: Add or remove users with `addUserToList` and `removeUserFromList`.
- **Upload Receipts**: Generate a pre-signed URL with `generateReceiptUploadURL` and upload receipts to S3.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the ISC License.

## Contact

For questions or support, please contact [Sam Weninger](mailto:sweninger99@gmail.com).
