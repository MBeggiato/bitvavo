import bitvavo from "npm:bitvavo";
import { debug, log, LogType } from "./util.ts";

const APIKEY = Deno.env.get("APIKEY") || "";
const APISECRET = Deno.env.get("APISECRET") || "";

const b = new bitvavo().options({
    APIKEY,
    APISECRET,
    ACCESSWINDOW: 10000,
    RESTURL: "https://api.bitvavo.com/v2",
    WSURL: "wss://ws.bitvavo.com/v2/",
    DEBUGGING: debug,
});

interface BalanceResponse {
    available: string;
}

interface PriceResponse {
    price: string;
}

export async function sendBalanceAndPrice(socket: WebSocket): Promise<void> {
    try {
        const balance = await getBalance();
        const price = await getPrice();
        const message = { balance, price };
        socket.send(JSON.stringify(message));
    } catch (error) {
        if (error instanceof Error) {
            log(error.message, LogType.ERROR);
        } else {
            log(String(error), LogType.ERROR);
        }
        socket.close();
    }
}

export async function getBalance(symbol: string = ""): Promise<BalanceResponse[] | BalanceResponse | undefined> {
    try {
        const response = await b.balance();
        if (symbol) {
            return response.find((r: { symbol: string; }) => r.symbol === symbol);
        }
        return response;
    } catch (error) {
        if (error instanceof Error) {
            log(error.message, LogType.ERROR);
        } else {
            log(String(error), LogType.ERROR);
        }
        return undefined;
    }
}

export async function getPrice(symbol: string = "BTC"): Promise<string | undefined> {
    try {
        const response: PriceResponse = await b.tickerPrice({ market: symbol + "-EUR" });
        return response.price;
    } catch (error) {
        if (error instanceof Error) {
            log(error.message, LogType.ERROR);
        } else {
            log(String(error), LogType.ERROR);
        }
        return undefined;
    }
}

export async function getValue(symbol: string = ""): Promise<string | undefined> {
    try {
        const balance = await getBalance(symbol);
        const price = await getPrice(symbol);
        if (balance && price) {
            if (Array.isArray(balance)) {
                const totalAvailable = balance.reduce((acc, curr) => acc + Number(curr.available), 0);
                return (totalAvailable * Number(price)).toFixed(2);
            } else {
                return (Number(balance?.available) * Number(price)).toFixed(2);
            }
        }
        return undefined;
    } catch (error) {
        if (error instanceof Error) {
            log(error.message, LogType.ERROR);
        } else {
            log(String(error), LogType.ERROR);
        }
        return undefined;
    }
}