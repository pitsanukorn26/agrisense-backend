import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestError } from "../utils/errors.js";

const {
  S3_ENDPOINT,
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET,
  PUBLIC_ASSET_BASE,
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

export async function uploadBuffer(
  buffer: Buffer,
  key: string,
  contentType: string
) {
  if (!s3) {
    throw new BadRequestError("Storage is not configured");
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const base = PUBLIC_ASSET_BASE?.replace(/\/$/, "");
  return base ? `${base}/${key}` : key;
}
