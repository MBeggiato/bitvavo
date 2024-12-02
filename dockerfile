FROM denoland/deno:2.1.2

WORKDIR /app

COPY . .

RUN deno install 

RUN deno cache main.ts

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-env","--allow-read","--allow-sys", "main.ts"]