import {
  Server,
  Canister,
  ic,
  query,
  Record,
  nat16,
  Vec,
  HeaderField,
  Principal,
  blob,
  Opt,
  bool,
  text,
  Func,
  Variant,
  None,
} from "azle";
import express from "express";

export default Server(() => {
  const app = express();

  const Token = Record({
    // add whatever fields you'd like
    arbitrary_data: text,
  });

  const StreamingCallbackHttpResponse = Record({
    body: blob,
    token: Opt(Token),
  });

  const Callback = Func([text], StreamingCallbackHttpResponse, "query");

  const CallbackStrategy = Record({
    callback: Callback,
    token: Token,
  });

  const StreamingStrategy = Variant({
    Callback: CallbackStrategy,
  });

  const HttpResponse = Record({
    status_code: nat16,
    headers: Vec(HeaderField),
    body: blob,
    streaming_strategy: Opt(StreamingStrategy),
    upgrade: Opt(bool),
  });

  const HttpRequest = Record({
    method: text,
    url: text,
    headers: Vec(HeaderField),
    body: blob,
    certificate_version: Opt(nat16),
  });

  const HeroNftCanister = Canister({
    http_request: query([HttpRequest], HttpResponse),
  });

  let heroCanister: typeof HeroNftCanister;

  // main function, to read from other canister
  // parse it and return with the png transformation
  app.get("/", async (req, res) => {
    if (!req.query.hero_id) res.send(`Query parameter "hero_id" is required.`);

    // setup and call Hero NFT
    let heroCanister = HeroNftCanister(
      Principal.fromText("br5f7-7uaaa-aaaaa-qaaca-cai"),
    );

    let result = await ic.call(heroCanister.http_request, {
      args: [
        {
          url: "/?index=" + req.query.hero_id,
          method: "get",
          headers: [],
          body: Buffer.from(""),
          certificate_version: None,
        },
      ],
    });

    const svg = Buffer.from(result.body).toString("utf-8");
    if (svg.substring(0, 14) === "Obsidian Tears")
      res.send(`Hero NFT with id ${req.query.hero_id}, not found.`);

    res.send(`<h1>${req.query.hero_id}</h1>`);
  });

  return app.listen();
});
