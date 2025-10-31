import { TableServiceClient, TableClient } from "@azure/data-tables";
import { DefaultAzureCredential, AzureCliCredential } from "@azure/identity";

// Configuration for local vs production environments
const isLocal = process.env.NODE_ENV === 'development';
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const account_url = storageAccountName 
  ? `https://${storageAccountName}.table.core.windows.net/`
  : process.env.AZURE_TABLES_URL || "https://your-storage-account.table.core.windows.net/";

let tableServiceClient: TableServiceClient;
let bandsClient: TableClient;
let reviewsClient: TableClient;

if (isLocal && connectionString) {
  // Use connection string ONLY for local Azurite development
  console.log('Using connection string for local Azurite development');
  const clientOptions = { allowInsecureConnection: true };
  tableServiceClient = TableServiceClient.fromConnectionString(connectionString, clientOptions);
  bandsClient = TableClient.fromConnectionString(connectionString, 'bands', clientOptions);
  reviewsClient = TableClient.fromConnectionString(connectionString, 'reviews', clientOptions);
} else {
  // Use managed identity for production (required when shared keys are disabled)
  console.log('Using managed identity for production');
  console.log('Storage account:', storageAccountName);
  console.log('Account URL:', account_url);
  
  if (!storageAccountName) {
    throw new Error('AZURE_STORAGE_ACCOUNT_NAME is required for managed identity authentication');
  }
  
  try {
    // Use DefaultAzureCredential which will try managed identity
    const credential = new DefaultAzureCredential();
    
    tableServiceClient = new TableServiceClient(account_url, credential);
    bandsClient = new TableClient(account_url, 'bands', credential);
    reviewsClient = new TableClient(account_url, 'reviews', credential);
    
    console.log('Table clients initialized with managed identity');
  } catch (error) {
    console.error('Failed to initialize table clients with managed identity:', error);
    throw error;
  }
}

// Bootstrap function to create tables if they don't exist
const bootstrap = async () => {
  try {
    // Create tables if they don't exist
    await tableServiceClient.createTable('bands', { 
      onResponse: (response) => {
        if (response.status === 409) {
          console.log('Bands table already exists');
        } else if (response.status === 201) {
          console.log('Bands table created successfully');
        }
      }
    });
    
    await tableServiceClient.createTable('reviews', {
      onResponse: (response) => {
        if (response.status === 409) {
          console.log('Reviews table already exists');
        } else if (response.status === 201) {
          console.log('Reviews table created successfully');
        }
      }
    });
  } catch (error) {
    console.log('Error during table initialization:', error);
  }
};

// Initialize tables on module load
bootstrap();

export const Bands = bandsClient;
export const Reviews = reviewsClient;
