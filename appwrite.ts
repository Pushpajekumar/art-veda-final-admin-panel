import { Client, Account, Databases, Storage } from "appwrite";

export const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6815dda60027ce5089d8"); // Replace with your project ID

export const account = new Account(client);
export const database = new Databases(client);
export const storage = new Storage(client);
export { ID, Query } from "appwrite";
