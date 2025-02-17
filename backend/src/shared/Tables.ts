import { TableServiceClient, TableClient } from "@azure/data-tables";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const account_url = process.env.AZURE_TABLES_URL;

const tableServiceClient = new TableServiceClient(account_url, credential);


const bootstrap = async () => {
}

export const Bands = new TableClient(account_url, 'bands', credential);
export const Reviews = new TableClient(account_url, 'reviews', credential);
