import { Dividend } from './api/types.ts';

const HEADER_RANGE = 'A1:J1';

type Header = {
	name: string;
	index: number;
};
const HEADERS: Header[] = [
	{ name: 'ID', index: 0 },
	{ name: 'PayDate', index: 1 },
	{ name: 'Type', index: 2 },
  { name: 'Symbol', index: 3 },
  { name: 'AmountWithoutTax', index: 4 },
  { name: 'Amount', index: 5 },
  { name: 'Currency', index: 6 },
  { name: 'Observation', index: 7 },
  { name: 'Account', index: 8 },
  { name: 'ExchangeCode', index: 9 },
];
const HEADERS_GROUPED = HEADERS.reduce((acc, header) => {
  acc[header.name] = header;
  return acc;
}, {} as { [key: string]: Header });


const DATA_START_COL_ID = 1;
const FILEDATA_RANGE = 'A2:A';

enum IncomeType {
	Dividend = 'DIVIDEND',
}

type PopulateDividendsParams = {
	sheetName: string;
	dividends: Dividend[];
};

function filterEmpty(value: string[]) {
	return value[0] != '';
}

const getOrCreateSheet = (
	sheetName: string,
	spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
) => {
	let sheet = spreadSheet.getSheetByName(sheetName);
	if (!sheet) {
		sheet = spreadSheet.insertSheet(sheetName);
		sheet.getRange(HEADER_RANGE).setValues([HEADERS.map((header) => header.name)]);
	}
	return sheet;
};

type ExistingUUIDs = {
	[uuid: string]: boolean;
};

/**
 * We want to populate the dividends sheet with the dividends we have received.
 */
export const populateDividends = ({
	dividends,
	sheetName,
}: PopulateDividendsParams) => {
	Logger.log(`Populating dividends sheet with ${dividends.length} dividends`);

	const sortedDividends = dividends.sort((a, b) =>
		a.payDate.getTime() - b.payDate.getTime()
	);
	const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();

	const currentSheet = getOrCreateSheet(sheetName, spreadSheet);

	const sheetData: string[][] = currentSheet.getRange(FILEDATA_RANGE)
		.getValues().filter(filterEmpty);

	const existingUUIDs: ExistingUUIDs = sheetData.reduce((acc, row) => {
		acc[row[0]] = true;
		return acc;
	}, {} as ExistingUUIDs);

	Logger.log(`Found ${Object.keys(existingUUIDs).length} existing dividends`);

	const newDividends = sortedDividends.filter((dividend) =>
		!existingUUIDs[dividend.uuid]
	);

	const processedData: any[][] = [];
	for (const dividend of newDividends) {
    const row = Array(HEADERS.length).fill('');

    row[HEADERS_GROUPED.ID.index] = dividend.uuid;
    row[HEADERS_GROUPED.PayDate.index] = dividend.payDate;
    row[HEADERS_GROUPED.Type.index] = IncomeType.Dividend;
    row[HEADERS_GROUPED.Symbol.index] = dividend.symbol;
    row[HEADERS_GROUPED.AmountWithoutTax.index] = dividend.grossAmount;
    row[HEADERS_GROUPED.Amount.index] = dividend.netAmount;
    row[HEADERS_GROUPED.Currency.index] = dividend.currency;

    row[HEADERS_GROUPED.Observation.index] = dividend.description;
    row[HEADERS_GROUPED.Account.index] = dividend.account;
    row[HEADERS_GROUPED.ExchangeCode.index] = dividend.exchangeCode;

		processedData.push(row);
	}

	Logger.log(`Found ${processedData.length} new dividends`);

	if (processedData.length === 0) {
		return;
	}

	currentSheet.getRange(
		sheetData.length + 2,
		DATA_START_COL_ID,
		processedData.length,
		processedData[0].length,
	).setValues(processedData);
};
