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
    
    // The headers we want to set for the blob
    const blobUploadOptions = {
        blobHTTPHeaders: {
            // This ensures the browser tries to display the image instead of downloading it.
            blobContentDisposition: `inline; filename=${fileName}`
        }
    };
    
    await blockBlobClient.uploadData(buffer, blobUploadOptions);
    return blockBlobClient.url;
};

module.exports = {
    uploadToAzure
};
