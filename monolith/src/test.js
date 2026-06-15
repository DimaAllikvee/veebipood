const http = require("http");

let passed = 0;
let failed = 0;
let token = null;

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: "localhost", port: 3000, path, method, headers: { "Content-Type": "application/json", ...headers } },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
          catch { resolve({ status: res.statusCode, body: d }); }
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function test(name, condition, actual) {
  if (condition) { console.log(`  PASS: ${name}`); passed++; }
  else { console.log(`  FAIL: ${name} — saadi: ${JSON.stringify(actual)}`); failed++; }
}

async function run() {
  console.log("\nKäivitan automaatteste...\n");

  console.log("1. Tervise kontroll");
  const h = await request("GET", "/health").catch(() => ({ status: 0 }));
  test("Server vastab", h.status === 200, h.status);

  console.log("\n2. Tooted");
  const p = await request("GET", "/api/products");
  test("Tooted laetakse", p.status === 200, p.status);
  test("Tooteid on olemas", p.body.products && p.body.products.length > 0, p.body);

  console.log("\n3. Toodete otsing");
  const s = await request("GET", "/api/products/search?name=hiir");
  test("Otsing töötab", s.status === 200, s.status);
  test("Leidis toote", s.body.results && s.body.results.length > 0, s.body);

  console.log("\n4. Sisselogimine");
  const l = await request("POST", "/api/users/login", { username: "mari", password: "1234" });
  test("Sisselogimine õnnestus", l.status === 200, l.status);
  test("Token on olemas", l.body.token !== undefined, l.body);
  token = l.body.token;

  console.log("\n5. Vale parool");
  const w = await request("POST", "/api/users/login", { username: "mari", password: "vale" });
  test("Vale parool tagastab 401", w.status === 401, w.status);

  console.log("\n6. Tellimuse loomine");
  const order = await request("POST", "/api/orders",
    { items: [{ productId: 1, quantity: 1 }] },
    { Authorization: token }
  );
  test("Tellimus loodud", order.status === 201, order.status);
  test("Staatus on 'vastu võetud'", order.body.order && order.body.order.status === "vastu võetud", order.body);

  console.log("\n7. Statistika");
  const stats = await request("GET", "/api/stats");
  test("Statistika töötab", stats.status === 200, stats.status);

  console.log(`\nTulemused: ${passed} läbis, ${failed} ebaõnnestus`);
  if (failed > 0) {
    console.log("\nVead leitud — paranda need enne push-i!");
  } else {
    console.log("\nKõik testid läbisid!");
  }
  process.exit(failed === 0 ? 0 : 1);
}

run().catch((e) => { console.error("Viga:", e.message); process.exit(1); });
