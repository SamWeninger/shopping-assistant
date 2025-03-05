const { docClient, PutCommand } = require('../utils/dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

async function generateReceiptUploadURL(listId, uploadedBy) {
  const receiptId = uuidv4();
  const key = `receipts/${receiptId}.jpg`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: 'image/jpeg',
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Immediately record the receipt metadata to DynamoDB:
    const receiptRecord = {
      ReceiptId: receiptId,
      ListId: listId,
      UploadedBy: uploadedBy,
      ImageURL: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      UploadedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: 'Receipts',
      Item: receiptRecord
    }));

    return { 
      receiptId, 
      uploadUrl: url, 
      imageUrl: receiptRecord.ImageURL
    };
  } catch (error) {
    console.error("Error generating receipt upload URL:", error);
    throw new Error("Failed to generate receipt upload URL");
  }
}

module.exports = { generateReceiptUploadURL };
