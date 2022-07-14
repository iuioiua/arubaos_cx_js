# arubaos_cx_js

Authenticate and interact with the ArubaOS-CX REST API using any
[Deno](https://deno.land/).

> Disclaimer: this is not an official Aruba software project.

## Usage

### Parameters

Each parameter, except for `host`, is defined in the following order of
precedence:

1. If defined within the function or class initialisation
2. If defined by its Environment variable
3. Its default value

The following are the parameters for `Client`.

| Parameter  | Environmental variable | Default value  | Description                             |
| ---------- | ---------------------- | -------------- | --------------------------------------- |
| `host`     | None                   | None           | IP address of the switch                |
| `version`  | `ARUBAOS_CX_VERSION`   | `v1`           | REST API version                        |
| `username` | `ARUBAOS_CX_USERNAME`  | `admin`        | Login username for the REST API session |
| `password` | `ARUBAOS_CX_PASSWORD`  | (empty string) | Login password for the REST API session |

### Environment variables

Environment variables are used by default to discourage explicitly defining
confidential credentials within scripts. Many have made the mistake of commiting
code containing such secrets.

### One request

Logs the user in, performs a HTTP request, then logs out, returning the
response. This is the easiest way to make a single request.

```ts
import { fetchOnce } from "https://deno.land/x/arubaos_cx/mod.ts";

const response = await fetchOnce({
  host: "10.20.30.40",
  version: "v10.08",
}, "/system");
```

### Multiple requests

```ts
import { Client } from "https://deno.land/x/arubaos_cx/mod.ts";

const client = new Client({
  host: "10.20.30.40",
  version: "v10.08",
});
await client.login();
const response1 = await client.fetch("/system");
const response2 = await client.fetch("/firmware");
...
await client.logout();
```

## Principles

- Designed to be fundamentally simple
- Based on and has a similar API to the
  [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- Encourages secure use of secrets via environmental variables
- Aims to be versatile (likely one day supporting Deno,
  [NodeJS](https://nodejs.org) and the browser) and maximise work velocity

## Testing

> Note: Tests must run with environmental variables defined, including an extra
> `ARUBAOS_CX_HOST`.

```bash
ARUBAOS_CX_HOST=10.20.30.40 ARUBAOS_CX_PASSWORD=password deno task test
```
