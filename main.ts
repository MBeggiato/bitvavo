import "jsr:@std/dotenv/load";
import { debug, log, LogType } from "./util.ts";
import { getBalance, getPrice, sendBalanceAndPrice } from "./api.ts";

const APIKEY = Deno.env.get("APIKEY");
const APISECRET = Deno.env.get("APISECRET");

if (!APIKEY || !APISECRET) {
  log("Please provide APIKEY and APISECRET in .env file", LogType.ERROR);
  Deno.exit();
}

const PATHS = {
  BALANCE: "/api/balance",
  PRICE: "/api/price",
  TOTAL: "/api/total",
  ALL: "/api/all",
};

let interval: number | undefined;

function handleGetRequest(url: URL): Promise<Response> {
  switch (url.pathname) {
    case PATHS.BALANCE:
      return getBalance().then((balance) =>
        new Response(JSON.stringify({ balance }), {
          headers: { "Content-Type": "application/json" },
        })
      );
    case PATHS.PRICE:
      return getPrice().then((price) =>
        new Response(JSON.stringify({ price }), {
          headers: { "Content-Type": "application/json" },
        })
      );
    case PATHS.TOTAL:
      return Promise.all([getBalance(), getPrice()]).then(([balance, price]) =>
        new Response(JSON.stringify((Number(balance) * Number(price)).toFixed(2)), {
          headers: { "Content-Type": "application/json" },
        })
      );
    case PATHS.ALL:
      return Promise.all([getBalance(), getPrice()]).then(([balance, price]) => {
        const total = (Number(balance) * Number(price)).toFixed(2) + " EUR";
        return new Response(JSON.stringify({ balance, price, total }), {
          headers: { "Content-Type": "application/json" },
        });
      });
    default:
      return Promise.resolve(new Response(null, { status: 404 }));
  }
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


