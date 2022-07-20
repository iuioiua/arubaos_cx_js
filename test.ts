import { fetchOnce } from "./mod.ts";
import { assert } from "./deps.ts";

/** All environmental variables need to be defined */
Deno.test("fetchOnce", async () => {
  const response = await fetchOnce({
    host: Deno.env.get("ARUBAOS_CX_HOST")!,
  }, "/system");
  assert(response.ok);
  await response.body?.cancel();
});
