import { BlobServiceClient } from "@azure/storage-blob";

const { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_SAS, AZURE_STORAGE_CONTAINER } =
  process.env;

export function getAzureContainer() {
  if (!AZURE_STORAGE_ACCOUNT || !AZURE_STORAGE_SAS || !AZURE_STORAGE_CONTAINER) {
    return null;
  }

  const sas = AZURE_STORAGE_SAS.startsWith("?")
    ? AZURE_STORAGE_SAS
    : `?${AZURE_STORAGE_SAS}`;
  const serviceUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net${sas}`;
  const serviceClient = new BlobServiceClient(serviceUrl);
  return serviceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
}
