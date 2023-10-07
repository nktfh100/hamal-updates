export const sleep = (time: number) =>
	new Promise((res) => setTimeout(res, time));

export function log(...args: any[]): void {
	const timestamp = new Date().toISOString();
	console.log(timestamp, ...args);
}
