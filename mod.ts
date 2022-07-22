import { assert } from "./deps.ts";

/** Turns a set-cookie header into a useable cookie header string value. */
function getSetCookie(headers: Headers): string {
  return headers.get("set-cookie")!
    .split(", ")
    .flatMap((cookie) => cookie.split("; ")[0])
    .join("; ");
}

/** Client initialisation parameters. */
export interface ClientInit {
  /** Switch IP address or host. */
  host: string;
  /** Switch REST API version. Defaults to `v1`. */
  version?: "v1" | "v10.04" | "v10.08" | "v10.09" | "v10.10" | "latest";
  /** Switch login username. Defaults to `admin`. */
  username?: string;
  /** Switch login password. Defaults to an empty string. */
  password?: string;
}

/** Contains methods for logging in/out and making authenticated requests. */
export class Client {
  #username: string;
  #password: string;
  #baseURL: URL;
  #cookie?: string;

  constructor(init: ClientInit) {
    const version = init.version ??
      Deno.env.get("ARUBAOS_CX_VERSION") ?? "v1";
    this.#username = init.username ??
      Deno.env.get("ARUBAOS_CX_USERNAME") ?? "admin";
    this.#password = init.password ??
      Deno.env.get("ARUBAOS_CX_PASSWORD") ?? "";
    this.#baseURL = new URL("/rest/" + version, "https://" + init.host);
  }

  /** Creates an authenticated request. */
  request(path: string, init?: RequestInit): Request {
    const request = new Request(this.#baseURL + path, init);
    if (this.#cookie) {
      request.headers.set("cookie", this.#cookie!);
    }
    return request;
  }

  /** Performs an authenticated request. */
  async fetch(path: string, init?: RequestInit): Promise<Response> {
    return await fetch(this.request(path, init));
  }

  /** Logs the user in and stores the authentication cookie. */
  async login(): Promise<void> {
    const params = new URLSearchParams({
      username: this.#username,
      password: this.#password,
    });
    const response = await this.fetch("/login?" + params, {
      method: "POST",
    });
    assert(response.ok, await response.text());
    this.#cookie = getSetCookie(response.headers);
  }

  /** Logs the user out and removes the authentication cookie. */
  async logout(): Promise<void> {
    const response = await this.fetch("/logout", {
      method: "POST",
    });
    assert(response.ok, await response.text());
    this.#cookie = undefined;
  }

  /** Performs a request inbetween automatic login/logout. */
  async fetchOnce(path: string, init?: RequestInit): Promise<Response> {
    await this.login();
    const response = await this.fetch(path, init);
    await this.logout();
    return response;
  }
}

/** Creates a client and performs a request inbetween automatic login/logout. */
export async function fetchOnce(
  clientInit: ClientInit,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const client = new Client(clientInit);
  return await client.fetchOnce(path, init);
}
