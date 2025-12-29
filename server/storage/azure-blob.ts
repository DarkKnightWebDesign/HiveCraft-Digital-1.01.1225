import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import type { Request } from 'express';

// Azure Blob Storage configuration
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'hivecraft-files';

let blobServiceClient: BlobServiceClient | null = null;

/**
 * Initialize Azure Blob Storage client
 * Connects to Azure Storage account using credentials from environment variables
 */
function getBlobServiceClient(): BlobServiceClient {
  if (!blobServiceClient) {
    if (!accountName || !accountKey) {
      throw new Error(
        'Azure Storage credentials not configured. Set AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY in .env'
      );
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );
  }

  return blobServiceClient;
}

/**
 * Ensure the container exists, create if it doesn't
 */
async function ensureContainer(): Promise<void> {
  try {
    const client = getBlobServiceClient();
    const containerClient = client.getContainerClient(containerName);
    
    const exists = await containerClient.exists();
    if (!exists) {
      await containerClient.create({
        access: 'blob' // Public read access for blobs
      });
      console.log(`Created blob container: ${containerName}`);
    }
  } catch (error) {
    console.error('Error ensuring container exists:', error);
    throw error;
  }
}

export interface UploadResult {
  url: string;
  blobName: string;
  contentType: string;
  size: number;
}

/**
 * Upload a file to Azure Blob Storage
 * @param file - Express-fileupload file object or Buffer
 * @param folder - Optional folder path within container (e.g., 'projects', 'profiles')
 * @param filename - Custom filename (auto-generated if not provided)
 * @returns Upload result with URL and metadata
 */
export async function uploadFile(
  file: Express.Multer.File | { data: Buffer; name: string; mimetype: string },
  folder?: string,
  filename?: string
): Promise<UploadResult> {
  try {
    await ensureContainer();

    const client = getBlobServiceClient();
    const containerClient = client.getContainerClient(containerName);

    // Generate unique blob name
    const timestamp = Date.now();
    const originalName = 'name' in file ? file.name : file.originalname;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobName = folder
      ? `${folder}/${timestamp}_${filename || sanitizedName}`
      : `${timestamp}_${filename || sanitizedName}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Get file data
    const fileData = 'data' in file ? file.data : file.buffer;
    const contentType = file.mimetype || 'application/octet-stream';

    // Upload to Azure
    await blockBlobClient.uploadData(fileData, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });

    return {
      url: blockBlobClient.url,
      blobName,
      contentType,
      size: fileData.length
    };
  } catch (error) {
    console.error('Error uploading file to Azure Blob Storage:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Delete a file from Azure Blob Storage
 * @param blobName - Full blob name (including folder path)
 */
export async function deleteFile(blobName: string): Promise<void> {
  try {
    const client = getBlobServiceClient();
    const containerClient = client.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.delete();
  } catch (error) {
    console.error('Error deleting file from Azure Blob Storage:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Get a temporary SAS URL for private blob access
 * @param blobName - Full blob name
 * @param expiryMinutes - Minutes until URL expires (default: 60)
 */
export async function getBlobSasUrl(
  blobName: string,
  expiryMinutes: number = 60
): Promise<string> {
  try {
    const client = getBlobServiceClient();
    const containerClient = client.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // For simplicity, returning direct URL
    // In production, implement SAS token generation for private access
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error generating SAS URL:', error);
    throw new Error('Failed to generate blob URL');
  }
}

/**
 * List files in a folder
 * @param folder - Folder path prefix
 */
export async function listFiles(folder?: string): Promise<Array<{
  name: string;
  url: string;
  size: number;
  lastModified: Date;
}>> {
  try {
    const client = getBlobServiceClient();
    const containerClient = client.getContainerClient(containerName);

    const files: Array<{ name: string; url: string; size: number; lastModified: Date }> = [];

    for await (const blob of containerClient.listBlobsFlat({ prefix: folder })) {
      const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
      files.push({
        name: blob.name,
        url: blockBlobClient.url,
        size: blob.properties.contentLength || 0,
        lastModified: blob.properties.lastModified || new Date()
      });
    }

    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
}

/**
 * Check if Azure Blob Storage is configured
 */
export function isBlobStorageConfigured(): boolean {
  return Boolean(accountName && accountKey);
}
