import openssl from "openssl-nodejs";
import { readFileSync } from "fs";
import { Pems } from "./getLeCert";

export async function getSelfSignedCert(): Promise<Pems> {
  await new Promise((resolve, reject) => {
    openssl(
      "openssl req -nodes -new -x509 -keyout server.key -out server.cert",
      (err: Error | null, out: Buffer): void => {
        if (err) {
          reject(err);
        } else {
          resolve(out);
        }
      }
    );
  });
  return {
    privkey: readFileSync("server.key").toString(),
    cert: readFileSync("server.cert").toString()
  };
}
