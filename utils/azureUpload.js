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

// Utility function to determine the MIME type based on the file extension
function getMimeType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'pdf': 'application/pdf'
    };
    return mimeTypes[extension] || 'application/octet-stream';
}

const uploadToAzure = async (buffer, fileName) => {
    const contentType = getMimeType(fileName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const uploadOptions = {
        blobHTTPHeaders: {
            blobContentType: contentType,
            blobContentDisposition: `inline; filename=${fileName}`
        }
    };
    await blockBlobClient.uploadData(buffer, uploadOptions);
    return blockBlobClient.url;
};

const deleteFromAzure = async (blobName) => {
    const decodedBlobName = decodeURIComponent(blobName);
    const blockBlobClient = containerClient.getBlockBlobClient(decodedBlobName);
    try {
        const response = await blockBlobClient.delete();
        return response;
    } catch (error) {
        console.error("Error while deleting blob:", error);
        return false;
    }
};

module.exports = {
    uploadToAzure,
    deleteFromAzure
};




// const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

// const accountName = 'sr520construction';
// const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
// const containerName = '520-uploads';

// const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
// const blobServiceClient = new BlobServiceClient(
//   `https://${accountName}.blob.core.windows.net`,
//   sharedKeyCredential
// );

// // Create a container client
// const containerClient = blobServiceClient.getContainerClient(containerName);

// // Utility function to determine the MIME type based on the file extension
// function getMimeType(fileName) {
//     const extension = fileName.split('.').pop().toLowerCase();
//     const mimeTypes = {
//         'png': 'image/png',
//         'jpg': 'image/jpeg',
//         'jpeg': 'image/jpeg',
//         'gif': 'image/gif',
//         'pdf': 'application/pdf'
//     };
//     return mimeTypes[extension] || 'application/octet-stream';
// }

// const uploadToAzure = async (buffer, fileName) => {
//     const contentType = getMimeType(fileName);
//     const blockBlobClient = containerClient.getBlockBlobClient(fileName);
//     const uploadOptions = {
//         blobHTTPHeaders: {
//             blobContentType: contentType,
//             blobContentDisposition: `inline; filename=${fileName}`
//         }
//     };
//     await blockBlobClient.uploadData(buffer, uploadOptions);
//     return blockBlobClient.url;
// };

// const deleteFromAzure = async (blobName) => {
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//     await blockBlobClient.delete();
// };


// module.exports = {
//     uploadToAzure,
//     deleteFromAzure
// };

// const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

// const accountName = "sr520construction";
// const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
// const containerName = "520-uploads";

// const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
// const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);
// const containerClient = blobServiceClient.getContainerClient(containerName);

// const uploadToAzure = async (data, filename) => {
//     const blobClient = containerClient.getBlockBlobClient(filename);
//     const uploadOptions = {
//         blobHTTPHeaders: {
//             blobContentType: "application/octet-stream",
//             blobContentDisposition: `inline; filename=${filename}`
//         }
//     };

//     await blobClient.uploadData(data, uploadOptions);
//     return blobClient.url;
// };

// const deleteFromAzure = async filename => {
//     const blobClient = containerClient.getBlockBlobClient(filename);
//     await blobClient.delete();
// };

// module.exports = {
//     uploadToAzure,
//     deleteFromAzure
// };
