function getSetCookie(headers: Headers): string {
  return headers.get("set-cookie")!
    .split(";")[0];
}

export interface ClientInit {
  origin: string;
  version?: "v1" | "v10.04" | "v10.08";
  username?: string;
  password?: string;
}

export class Client {
  #origin: string;
  #version: ClientInit["version"];
  #username: string;
  #password: string;
  #cookie?: string;

  constructor({ origin, version, username, password }: ClientInit) {
    this.#origin = origin;
    this.#version = version ?? "v1";
    this.#username = username ?? "admin";
    this.#password = password ?? "";
  }

  request(path: string, init?: RequestInit): Promise<Response> {
    const request = new Request(
      this.#origin + "/rest/" + this.#version + path,
      init,
    );
    request.headers.set("cookie", this.#cookie!);
    return fetch(request);
  }

  async login(): Promise<void> {
    const { body, ok, headers } = await this.request("/login", {
      method: "POST",
      body: new URLSearchParams({
        username: this.#username,
        password: this.#password,
      }),
    });
    await body?.cancel();
    console.assert(ok, "Login failed");
    this.#cookie = getSetCookie(headers);
  }

  async logout(): Promise<void> {
    const { body, ok } = await this.request("/login", {
      method: "POST",
    });
    await body?.cancel();
    console.assert(ok, "Logout failed");
    this.#cookie = undefined;
  }
}

export async function request(
  clientInit: ClientInit,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const client = new Client(clientInit);
  await client.login();
  const response = await client.request(path, init);
  await client.logout();
  return response;
}
