import { getLeCert, Pems } from "./getLeCert";
import {
  createServer as httpCreateServer,
  ServerResponse,
  IncomingMessage
} from "http";
import { createServer as httpsCreateServer } from "https";
import { getSelfSignedCert } from "./getSelfSignedCert";

export type Options = {
  domain: string;
  handler: (req: IncomingMessage, res: ServerResponse) => void;
  httpRedirectPort?: number;
  httpsPort?: number;
};

export async function getLetsEncryptServers(options: Options): Promise<void> {
  const httpServer = httpCreateServer(
    (req: IncomingMessage, res: ServerResponse) => {
      res.end("see https");
    }
  );
  httpServer.listen(options.httpRedirectPort || 80);
  let certs: Pems;
  if (options.domain === "localhost") {
    certs = await getSelfSignedCert();
  } else {
    certs = await getLeCert(options.domain);
  }
  const httpsServer = httpsCreateServer(
    {
      key: certs.privkey,
      cert: certs.cert,
      ca: certs.chain
    },
    options.handler
  );
  httpsServer.listen(options.httpsPort || 443);
}

getLetsEncryptServers({
  domain: "localhost",
  handler: (_req, res) => {
    res.end("it works!");
  }
});
