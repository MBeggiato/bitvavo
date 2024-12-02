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

export async function getBalance(): Promise<string | undefined> {
    try {
        const response: BalanceResponse[] = await b.balance();
        return response[0].available;
    } catch (error) {
        if (error instanceof Error) {
            log(error.message, LogType.ERROR);
        } else {
            log(String(error), LogType.ERROR);
        }
        return undefined;
    }
}

export async function getPrice(): Promise<string | undefined> {
    try {
        const response: PriceResponse = await b.tickerPrice({ market: "BTC-EUR" });
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