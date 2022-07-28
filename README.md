# arubaos_cx_js

Authenticate and interact with the
[ArubaOS-CX REST API](https://developer.arubanetworks.com/aruba-aoscx/docs)
using [Deno](https://deno.land/). Design principles:

- Must be fundamentally simple
- Based on and has a similar API to the
  [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- Built for scale and reduced time required to automate tasks

> Disclaimer: this is not an official Aruba software project.

## Usage

Must be run with the `--allow-run`, `--allow-env` and possibly the
`--unsafely-ignore-certificate-error` environment variables.

### One request

Logs the user in, performs a HTTP request, then logs out, returning the
response. This is the easiest way to make a single request.

```ts
import { fetchOnce } from "https://deno.land/x/arubaos_cx/mod.ts";

const response = await fetchOnce({ host: "10.20.30.40" }, "/system");
```

### Multiple requests

```ts
import { Client } from "https://deno.land/x/arubaos_cx/mod.ts";

const client = new Client({ host: "10.20.30.40" });
await client.login();
const response1 = await client.fetch("/system");
const response2 = await client.fetch("/firmware");
...
await client.logout();
```

### Default values

Each parameter, except for `host`, is defined in the following order of
precedence:

1. If defined within the function or class initialisation
2. If defined by its [environment variable](#environment-variables)
3. Its default value (see
   [documentation](https://doc.deno.land/https://deno.land/x/arubaos_cx))

### Environment variables

Environment variables are used by default to discourage explicitly defining
confidential credentials within scripts. Many have made the mistake of commiting
code containing such secrets. See
[documentation](https://doc.deno.land/https://deno.land/x/arubaos_cx) for more
information.

## Documentation

Check out the full documentation
[here](https://doc.deno.land/https://deno.land/x/arubaos_cx).

## Testing

```bash
ARUBAOS_CX_HOST=10.20.30.40 ARUBAOS_CX_PASSWORD=password deno task test
```

> Note: Tests must run with environmental variables defined, including an extra
> `ARUBAOS_CX_HOST`.
