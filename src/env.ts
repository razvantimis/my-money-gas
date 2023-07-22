import "https://deno.land/std@0.195.0/dotenv/load.ts";

function getEnv(key: string): string {
	const value = Deno.env.get(key);
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value;
}

export const INTERACTIVE_BROKERS_FLEX_WEB_TOKEN = getEnv(
	'INTERACTIVE_BROKERS_FLEX_WEB_TOKEN',
);

export const INTERACTIVE_BROKERS_FLEX_DIVIDENDS_QUERY_ID = getEnv(
  'INTERACTIVE_BROKERS_FLEX_DIVIDENDS_QUERY_ID',
);
