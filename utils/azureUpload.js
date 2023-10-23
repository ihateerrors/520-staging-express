const {
    BlobServiceClient,
    StorageSharedKeyCredential
  } = require("@azure/storage-blob");
  
  const accountName = "sr520construction";
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const containerName = "520-uploads";
  
  // Check if AZURE_STORAGE_ACCOUNT_KEY is set
  if (!accountKey) {
    throw new Error("AZURE_STORAGE_ACCOUNT_KEY is not set in environment variables.");
  }
  
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  
  function getMimeType(filename) {
    return {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      pdf: "application/pdf"
    }[filename.split(".").pop().toLowerCase()] || "application/octet-stream";
  }
  
  const uploadToAzure = async (buffer, filename) => {
    try {
      const mimeType = getMimeType(filename);
      const blockBlobClient = containerClient.getBlockBlobClient(filename);
      const options = {
        blobHTTPHeaders: {
          blobContentType: mimeType,
          blobContentDisposition: `inline; filename=${filename}`
        }
      };
      
      await blockBlobClient.uploadData(buffer, options);
      
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading to Azure:', error.message);
      throw error;
    }
  };
  
  module.exports = {
    uploadToAzure
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

// module.exports = {
//     uploadToAzure
// };




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
