import openssl from "openssl-nodejs";
import { readFileSync } from "fs";
import { Pems } from "./getLeCert";

export async function getSelfSignedCert(): Promise<Pems> {
  await new Promise((resolve, reject) => {
    const command =
      "openssl req -nodes -new -x509" +
      ' -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com"' +
      " -keyout server.key -out server.cert";
    openssl(command, (err: Error | null, out: Buffer): void => {
      if (err) {
        reject(err);
      } else {
        resolve(out);
      }
    });
  });
  return {
    privkey: readFileSync("server.key").toString(),
    cert: readFileSync("server.cert").toString()
  };
}
