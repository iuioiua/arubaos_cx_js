import { assert } from "./deps.ts";

/** Turns a set-cookie header into a useable cookie header value */
function getSetCookie(headers: Headers): string {
  return headers.get("set-cookie")!
    .split(", ")
    .flatMap((cookie) => cookie.split("; ")[0])
    .join("; ");
}

export interface ClientInit {
  host: string;
  version?: "v1" | "v10.04" | "v10.08";
  username?: string;
  password?: string;
}

export class Client {
  #username: string;
  #password: string;
  #baseURL: string;
  #cookie?: string;

  constructor(init: ClientInit) {
    const version = init.version ??
      Deno.env.get("ARUBAOS_CX_VERSION") ?? "v1";
    this.#username = init.username ??
      Deno.env.get("ARUBAOS_CX_USERNAME") ?? "admin";
    this.#password = init.password ??
      Deno.env.get("ARUBAOS_CX_PASSWORD") ?? "";
    this.#baseURL = "https://" + init.host + "/rest/" + version;
  }

  async request(path: string, init?: RequestInit): Promise<Response> {
    const request = new Request(this.#baseURL + path, init);
    request.headers.set("cookie", this.#cookie!);
    return await fetch(request);
  }

  async login(): Promise<void> {
    const response = await this.request("/login", {
      method: "POST",
      body: new URLSearchParams({
        username: this.#username,
        password: this.#password,
      }),
    });
    assert(response.ok, await response.text());
    this.#cookie = getSetCookie(response.headers);
  }

  async logout(): Promise<void> {
    const response = await this.request("/logout", {
      method: "POST",
    });
    assert(response.ok, await response.text());
    this.#cookie = undefined;
  }

  async requestOnce(path: string, init?: RequestInit): Promise<Response> {
    await this.login();
    const response = await this.request(path, init);
    await this.logout();
    return response;
  }
}

export async function requestOnce(
  clientInit: ClientInit,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const client = new Client(clientInit);
  return await client.requestOnce(path, init);
}
