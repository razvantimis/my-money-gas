import { Dividend } from "./types.ts";

const BASE_URL = "https://my-money-api.timis.workers.dev";
export async function fetchDividends(
  authToken: string,
): Promise<Dividend[]> {
  const url = `${BASE_URL}/dividends`;
  Logger.log(`Sending GET request to : ${url} `)

  const response = UrlFetchApp.fetch(url, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authToken,
    },
  });
  if( response.getResponseCode() != 200) {
    throw new Error(`Request failed with code ${response.getResponseCode()}`);
  }
  const data = JSON.parse(response.getContentText());
  return data;
}