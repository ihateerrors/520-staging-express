const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

const accountName = 'sr520construction';
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = '520-uploads';

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

// Create a container client
const containerClient = blobServiceClient.getContainerClient(containerName);

const uploadToAzure = async (buffer, fileName) => {
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadData(buffer);
    return blockBlobClient.url;
};

module.exports = {
    uploadToAzure
};
