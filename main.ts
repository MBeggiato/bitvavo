import "jsr:@std/dotenv/load";
import { debug, log, LogType } from "./util.ts";
import { getBalance, getPrice, getValue, sendBalanceAndPrice } from "./api.ts";

const APIKEY = Deno.env.get("APIKEY");
const APISECRET = Deno.env.get("APISECRET");

if (!APIKEY || !APISECRET) {
  log("Please provide APIKEY and APISECRET in .env file", LogType.ERROR);
  Deno.exit();
}

const PATHS = {
  BALANCE: "/api/balance",
  PRICE: "/api/price",
  VALUE: "/api/value",
  OVERVIEW: "/api/overview",
};

let interval: number | undefined;

function handleGetRequest(url: URL): Promise<Response> {

  if (url.pathname.includes(PATHS.BALANCE)) {
    const symbol = url.pathname.split("/")[3];
    return getBalance(symbol).then((balance) =>
      new Response(JSON.stringify({ balance }), {
        headers: { "Content-Type": "application/json" },
      })
    );
  } else if (url.pathname.includes(PATHS.VALUE)) {
    const symbol = url.pathname.split("/")[3];
    return getValue(symbol).then((value) =>
      new Response(JSON.stringify({ value }), {
        headers: { "Content-Type": "application/json" },
      })
    );
  } else if (url.pathname.includes(PATHS.PRICE)) {
    const symbol = url.pathname.split("/")[3];
    return getPrice(symbol).then((price) =>
      new Response(JSON.stringify({ price }), {
        headers: { "Content-Type": "application/json" },
      })
    );
  } else if (url.pathname.includes(PATHS.OVERVIEW)) {
    const symbol = url.pathname.split("/")[3];
    if (symbol) {
      const price = getPrice(symbol);
      const balance = getBalance(symbol);
      const value = getValue(symbol);
      return Promise.all([price, balance, value]).then(([price, balance, value]) =>
        new Response(JSON.stringify({ price, balance, value }), {
          headers: { "Content-Type": "application/json" },
        })
      );
    }
  }
  return Promise.resolve(new Response(null, { status: 404 }));
}

function handleWebSocket(socket: WebSocket) {
  socket.addEventListener("open", () => {
    log("A client connected to the socket!", LogType.INFO);
    interval = setInterval(() => {
      sendBalanceAndPrice(socket);
    }, 1000);
  });

  socket.addEventListener("close", () => {
    log("A client disconnected!", LogType.INFO);
    clearInterval(interval);
  });

  socket.addEventListener("message", (event) => {
    if (event.data === "close") {
      log("Closing connection!", LogType.INFO);
      clearInterval(interval);
      socket.close();
    } else {
      log(String(event.data), LogType.INFO);
    }
  });
}

Deno.serve((req) => {
  if (debug) {
    log(`${req.method} ${req.url}`, LogType.DEBUG);
  }

  const url = new URL(req.url);

  if (req.method === "GET") {
    return handleGetRequest(url);
  } else if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    handleWebSocket(socket);
    return response;
  } else {
    return new Response(null, { status: 501 });
  }
});


