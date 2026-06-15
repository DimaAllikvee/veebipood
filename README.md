# Veebipood

See on lihtne Node.js ja Express.js baasil loodud e-poe (veebipoe) backend API rakendus, mis võimaldab hallata tooteid, kasutajaid ja tellimusi. Kõik andmed hoitakse mälus (in-memory) ilma välise andmebaasita.

## Tehnoloogiad

- Node.js
- Express.js
- Docker & Docker Compose
- Sisseehitatud testimisskript (`node src/test.js`)

## Käivitamine

Selles projektis on nüüd nii algne **Monoliit** kui ka uus **Mikroteenuste** arhitektuur. 

**Mikroteenuste käivitamine (Soovitatud):**
1. Veendu, et oled projekti peakaustas.
2. Käivita: `docker compose -f docker-compose.microservices.yml up --build -d`
3. Rakendus (Gateway) on saadaval pordil 5070: `http://localhost:5070`
4. Seiskamiseks: `docker compose -f docker-compose.microservices.yml down`

**Vana Monoliidi käivitamine:**
1. Veendu, et oled projekti peakaustas.
2. Käivita Dockeriga: `docker compose -f docker-compose.monolith.yml up -d`
3. Monoliit on saadaval pordil 3000: `http://localhost:3000`

*(Kui soovid monoliiti käivitada ilma Dockerita, mine kausta `monolith/`, tee `npm install` ja käivita `node src/server.js`)*.

## Testikasutajad

Rakendusse on sisse ehitatud järgmised testikasutajad (vt `src/data.js`):
1. Kasutajanimi: `mari`, Parool: `1234` (Nimi: Mari Maasikas)
2. Kasutajanimi: `jaan`, Parool: `1234` (Nimi: Jaan Jansen)

## Teadaolevad vead

Rakenduses on kaks viga mida pead parandama (vead on juba parandatud!):

1. `src/routes/products.js` — otsing ei tööta
2. `src/routes/orders.js` — tellimuse staatus on vale

## API endpointid

### Kasutajad

| Meetod | URL | Kirjeldus |
|--------|-----|-----------|
| POST | /api/users/signup | Registreerib uue kasutaja (vajalikud väljad: username, password, name) |
| POST | /api/users/login | Logib kasutaja sisse ja tagastab autentimise tokeni |
| POST | /api/users/logout | Logib kasutaja välja (nõuab Authorization päist tokeniga) |
| GET | /api/users/me | Tagastab sisselogitud kasutaja info (nõuab Authorization päist) |

### Tooted

| Meetod | URL | Kirjeldus |
|--------|-----|-----------|
| GET | /api/products | Tagastab nimekirja kõikidest toodetest |
| GET | /api/products/:id | Tagastab konkreetse toote andmed ID järgi |
| GET | /api/products/search | Otsib tooteid nime järgi (näiteks `?name=sülearvuti`) |
| GET | /api/products/categories | Tagastab nimekirja kõikidest unikaalsetest tootekategooriatest |
| GET | /api/products/category/:cat | Tagastab kõik tooted valitud kategoorias |

### Tellimused

| Meetod | URL | Kirjeldus |
|--------|-----|-----------|
| POST | /api/orders | Loob uue tellimuse (nõuab sisselogimist ja `items` massiivi päringu kehas) |
| GET | /api/orders | Tagastab kõik süsteemis olevad tellimused |
| GET | /api/orders/me | Tagastab hetkel sisselogitud kasutaja tellimused |
| GET | /api/orders/:id | Tagastab konkreetse tellimuse ID järgi |
| PATCH | /api/orders/:id/status | Muudab tellimuse staatust (kehtivad: "vastu võetud", "töötlemisel", "saadetud", "kohale toimetatud") |

## Arhitektuur

1. **Mis arhitektuur see rakendus kasutab?**
   Monoliitne arhitektuur (kõik kood on ühes tükis) ning REST API.

2. **Millest sa seda järeldad?**
   Kogu süsteem jookseb ühest failist (`server.js`) ning pole jaotatud erinevateks sõltumatuteks programmideks või teenusteks. 

3. **Miks see arhitektuur on siin õige valik?**
   Sest projekt on väike. Seda on lihtne ja kiire arendada, testida ning käivitada. 

4. **Mis arhitektuuri kasutaksid kui rakendus peaks teenindama 1 miljonit kasutajat?**
   Mikroteenuseid (Microservices). Süsteem tuleks jagada eraldi väikesteks tükkideks (näiteks eraldi teenus toodetele ja tellimustele), et need peaksid vastu suurele koormusele. Samuti lisaksin päris andmebaasid.

## GitHub Actions

GitHub Actions on seadistatud failis `.github/workflows/ci.yml`. See on automaatne CI (Continuous Integration) pipeline, mis käivitub iga kord, kui kood lükatakse (push) `main` harusse või tehakse Pull Request.

Protsess teeb automaatselt järgmist:
1. Kloonib uusima koodi serverisse.
2. Seadistab Node.js (versioon 20) keskkonna.
3. Tõmbab alla kõik vajalikud npm paketid (`npm install`).
4. Käivitab testserveri taustal.
5. Käivitab automaattestid (`node src/test.js`), et kontrollida, kas kõik 11 testi läbivad edukalt. Kui mõni test ebaõnnestub, märgib GitHub Actions koodi vigaseks ega lase seda live-keskkonda.
