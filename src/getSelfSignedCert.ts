import openssl from "openssl-nodejs";
import { readFile } from "fs";
import { Pems } from "./getLeCert";

async function readFilePromise(fileName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    readFile(fileName, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function getPemsFromDisk(): Promise<Pems> {
  return {
    key: await readFilePromise("server.key"),
    cert: await readFilePromise("server.cert")
  };
}

export async function getSelfSignedCert(): Promise<Pems> {
  let pems: Pems;
  try {
    pems = await getPemsFromDisk();
  } catch (e) {
    await new Promise((resolve, reject) => {
      const command =
        "openssl req -nodes -new -x509" +
        ' -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=localhost"' +
        " -keyout server.key -out server.cert";
      openssl(command, (err: Error | null, out: Buffer): void => {
        if (err) {
          reject(err);
        } else {
          resolve(out);
        }
      });
    });
    pems = await getPemsFromDisk();
  }
  return pems;
}
