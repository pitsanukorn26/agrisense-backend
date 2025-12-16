import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { BlockBlobClient } from "@azure/storage-blob";
import crypto from "crypto";
import { BadRequestError } from "../utils/errors.js";
import { getAzureContainer } from "../config/azure-blob.js";

const {
  S3_ENDPOINT,
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET,
  PUBLIC_ASSET_BASE,
  AZURE_STORAGE_ACCOUNT,
  AZURE_STORAGE_SAS,
  AZURE_STORAGE_CONTAINER,
} = process.env;

const s3 =
  S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY && S3_BUCKET && S3_REGION
    ? new S3Client({
        region: S3_REGION,
        endpoint: S3_ENDPOINT,
        forcePathStyle: Boolean(S3_ENDPOINT),
        credentials: {
          accessKeyId: S3_ACCESS_KEY_ID,
          secretAccessKey: S3_SECRET_ACCESS_KEY,
        },
      })
    : null;

const azureContainer = getAzureContainer();

function buildPublicUrl(key: string) {
  const base = PUBLIC_ASSET_BASE?.replace(/\/$/, "");
  if (!base) return key;
  // Avoid logging SAS; PUBLIC_ASSET_BASE should already include container path
  const sas =
    AZURE_STORAGE_SAS && AZURE_STORAGE_SAS.length
      ? AZURE_STORAGE_SAS.startsWith("?")
        ? AZURE_STORAGE_SAS
        : `?${AZURE_STORAGE_SAS}`
      : "";
  return `${base}/${key}${sas}`;
}

function randomKey(filename: string) {
  const ext = filename.includes(".") ? filename.substring(filename.lastIndexOf(".")) : "";
  return `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
}

export async function uploadBuffer(
  buffer: Buffer,
  key: string,
  contentType: string
) {
  // Prefer Azure if configured
  if (azureContainer && AZURE_STORAGE_ACCOUNT && AZURE_STORAGE_SAS && AZURE_STORAGE_CONTAINER) {
    const blobKey = key || randomKey("upload.bin");
    const blobClient: BlockBlobClient = azureContainer.getBlockBlobClient(blobKey);
    await blobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
    return buildPublicUrl(blobKey);
  }

  if (s3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    return buildPublicUrl(key);
  }

  throw new BadRequestError("Storage is not configured");
}
