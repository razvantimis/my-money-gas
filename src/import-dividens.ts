import { parse as parseXml } from 'https://deno.land/x/xml@2.1.1/mod.ts';
import { parse as parseDate } from 'https://deno.land/std@0.194.0/datetime/parse.ts';
import { format as formatDate } from 'https://deno.land/std@0.194.0/datetime/format.ts';
import {
	INTERACTIVE_BROKERS_FLEX_DIVIDENDS_QUERY_ID,
	INTERACTIVE_BROKERS_FLEX_WEB_TOKEN,
} from './env.ts';
/**
 * Fetch https://www.interactivebrokers.com/Universal/servlet/FlexStatementService.SendRequest?t=TOKEN&q=QUERY_ID&v=3
 * @param token
 * @param flexQueryId
 */
async function getReferenceCodeFromFlexService(
	token: string,
	flexQueryId: string,
): Promise<any> {
	const url =
		`https://www.interactivebrokers.com/Universal/servlet/FlexStatementService.SendRequest?t=${token}&q=${flexQueryId}&v=3`;
	const response = await fetch(url);
	const xmlData = await response.text();
	const jsonData = parseXml(xmlData);
	if (jsonData.FlexStatementResponse?.Status !== 'Success') {
		throw new Error('Failed to fetch reference code from Flex Service');
	}
	return jsonData.FlexStatementResponse?.ReferenceCode;
}

/**
 * Fetch statement data from https://www.interactivebrokers.com/Universal/servlet/FlexStatementService.GetStatement?q=REFERENCE_CODE&t=TOKEN&v=3
 * @param token
 * @param flexQueryId
 * @returns
 */
async function fetchFlexStatmentData(
	token: string,
	flexQueryId: string,
): Promise<any> {
	const referenceCode = await getReferenceCodeFromFlexService(
		token,
		flexQueryId,
	);

	const url =
		`https://www.interactivebrokers.com/Universal/servlet/FlexStatementService.GetStatement?q=${referenceCode}&t=${token}&v=3`;
	const response = await fetch(url);
	const xmlData = await response.text();
	const jsonData = parseXml(xmlData);

	if (!jsonData.FlexQueryResponse?.FlexStatements) {
		throw new Error('Failed to fetch dividens data');
	}
	return jsonData.FlexQueryResponse.FlexStatements.FlexStatement;
}

type Dividend = {
	'@accountId': string;
	'@symbol': string;
	'@exDate': number;
	'@payDate': number;
	'@fee': number;
	'@netAmount': number;
	'#text': null | string;
};

type ExelDividend = {
	date: Date;
	displayDate: string;
	type: string;
	symbol: string;
	netAmount: number;
	currency: string;
	account: string;
	exchangeCode: string;
};

try {
	const data = await fetchFlexStatmentData(
		INTERACTIVE_BROKERS_FLEX_WEB_TOKEN,
		INTERACTIVE_BROKERS_FLEX_DIVIDENDS_QUERY_ID,
	);
	const dividends = data.OpenDividendAccruals.OpenDividendAccrual as Dividend[];

	const exelDividends: ExelDividend[] = [];
	for (const dividend of dividends) {
		const date = parseDate(dividend['@payDate'].toString(), 'yyyyMMdd');
		const exelDividend = {
			date,
			displayDate: formatDate(date, 'yyyy-MM-dd'),
			type: 'DIVIDEND',
			symbol: dividend['@symbol'],
			netAmount: dividend['@netAmount'],
			currency: 'USD',
			account: 'INTERACTIVE_BROKERS',
			exchangeCode: 'US',
		};
		exelDividends.push(exelDividend);
	}
	exelDividends.sort((a, b) => a.date.getTime() - b.date.getTime());

	console.log(JSON.stringify(exelDividends, null, 2));
} catch (e) {
	console.log(e);
}
