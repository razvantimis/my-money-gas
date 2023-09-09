declare let global: {
  doGet: (e?: GoogleAppsScript.Events.DoGet) =>
    | GoogleAppsScript.HTML.HtmlOutput
    | GoogleAppsScript.Content.TextOutput;
  doPost: (e?: GoogleAppsScript.Events.DoPost) =>
    | GoogleAppsScript.HTML.HtmlOutput
    | GoogleAppsScript.Content.TextOutput;
  [key: string]: () => void;
};
import { fetchDividends } from "./api/dividendsApi.ts";
import {populateDividends } from "./populateDividends.ts";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('My money')
      .addItem('Import dividends', 'importDividends')
     
      .addToUi();
}

function authenticateUser(user: string, password: string){
    const token = Utilities.newBlob(user + ":" + password);

    // Base64 Encoding
    const hash = Utilities.base64Encode(token.getBytes()) 

    return "Basic " + hash;
}

async function importDividends(){
  const authToken = authenticateUser("razvant", "5hh+@(n#hf8g}ZWF")
  const dividends = await fetchDividends(authToken);
  populateDividends({
    dividends,
    sheetName: 'Dividends',
  });
}



global.onOpen = onOpen;
global.importDividends = importDividends;