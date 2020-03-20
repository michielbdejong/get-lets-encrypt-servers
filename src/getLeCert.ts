import * as pkg from "../package.json";
import Greenlock from "greenlock";

export type Pems = {
  privkey: string;
  cert: string;
  chain: string;
};

export async function getLeCert(domain: string): Promise<Pems> {
  const greenlock = Greenlock.create({
    configDir: "./greenlock.d/config.json",
    packageRoot: ".",
    packageAgent: pkg.name + "/" + pkg.version,
    maintainerEmail: "michiel@unhosted.org",
    staging: true,
    notify: function(event, details) {
      if ("error" === event) {
        // `details` is an error object in this case
        console.error(details);
      }
    }
  });

  await greenlock.manager.defaults({
    agreeToTerms: true,
    subscriberEmail: "example@gmail.com"
  });
  const altnames = [domain, `www.${domain}`];
  await greenlock.add({
    subject: altnames[0],
    altnames: altnames
  });

  return greenlock.get({ servername: domain });
}
