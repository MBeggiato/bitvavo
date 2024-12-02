# Bitvavo
This project is a Deno application that interacts with the Bitvavo API to fetch balance and price information for cryptocurrencies. It also provides a WebSocket server to send this information to connected clients.


## Run localy
1. **Clone the repository:**
    ```sh
    git clone https://github.com/MBeggiato/bitvavo.git
    cd bitvavo
    ```

2. **Install Deno:** <br>
    Follow the instructions on the [Deno Website](https://docs.deno.com/runtime/) to install Deno2.

3. **Create a `.env` file:** <br>
    Copy the `.env.template` file and rename it to `.env`, then fill in your Bitvavo API key and secret. You can find instructions on how to create API keys [here](https://support.bitvavo.com/hc/en-us/articles/4405059841809-What-are-API-keys-and-how-do-I-create-them).

4. **Run the project:** <br>
    ```sh
    deno install
    deno task dev
    ```

5. **Access the REST API:** <br>
    In your browser, you can now access `http://localhost:8000`. <br>
    **API Endpoints** <br>
    The application provides the following API endpoints:

    - **GET /api/balance**: Returns the balance.
    - **GET /api/price**: Returns the price.
    - **GET /api/total**: Returns the total value (balance * price).
    - **GET /api/all**: Returns the balance, price, and total value.

    **WebSocket** <br>
    The application also provides a WebSocket server. When a client connects, it will receive balance and price updates every second.

## Run as container
You can also run this project inside a Docker container with the following compose file (provided in the repo):
```yml
services:
  deno-app:
    image: ghcr.io/mbeggiato/bitvavo:main
    ports:
      - "8000:8000"
    env_file:
      - .env
    command: [ "run", "--allow-net", "--allow-env", "--allow-read", "--allow-sys", "main.ts" ]

```

## Other
To turn on detailed logging, add `DEBUG=true` to your `.env` file.

## Don't have a Bitvavo account yet?
If you want to support my work, register using [my link](https://bitvavo.com/invite?a=BF0BED4330)*. Thank you! <br>
* *this gives me a bonus and you can trade up to €10,000 in cryptocurrencies without fees in the first week.*

