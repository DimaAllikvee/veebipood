# Veebipood

See on lihtne Node.js ja Express.js baasil loodud e-poe (veebipoe) backend API rakendus, mis võimaldab hallata tooteid, kasutajaid ja tellimusi. Kõik andmed hoitakse mälus (in-memory) ilma välise andmebaasita.

## Tehnoloogiad

- Node.js
- Express.js
- Docker & Docker Compose
- Sisseehitatud testimisskript (`node src/test.js`)

## Käivitamine

Dockeriga (soovitatud):
1. Klooni repositoorium
2. Käivita: `docker compose up --build -d`
3. Rakendus (API) on saadaval pordil 3000: `http://localhost:3000`

Ilma Dockerita:
1. Paigalda sõltuvused: `npm install`
2. Käivita server: `node src/server.js` (või `npm start`)

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
   Rakendus kasutab monoliitset klient-server API arhitektuuri ja REST arhitektuuri stiili. Samuti järgib see MVC (Model-View-Controller) stiilis jaotuse põhimõtteid: ruuterid toimivad kontrolleritena (Controller) ja `data.js` täidab mudeli (Model) rolli.

2. **Millest sa seda järeldad?**
   Kogu kood töötab ühesainsas Node.js protsessis (`server.js`) ega ole jaotatud erinevateks sõltumatuteks teenusteks. Koodi struktuur on jagatud loogilistesse kaustadesse: `src/routes` sisaldab endpointide loogikat ja suunamist, ning `src/data.js` hoolitseb andmete säilitamise eest.

3. **Miks see arhitektuur on siin õige valik?**
   Monoliitne arhitektuur on suurepärane valik väikeste projektide, laborite ja prototüüpide jaoks. Seda on lihtne käivitada, testida ja arendada. See ei vaja keerulist DevOps seadistust, võrguliikluse haldamist ega mitme andmebaasi sünkroniseerimist (erinevalt mikroteenustest).

4. **Mis arhitektuuri kasutaksid kui rakendus peaks teenindama 1 miljonit kasutajat?**
   1 miljoni kasutaja teenindamiseks kasutaksin Mikroteenuste (Microservices) arhitektuuri. Rakendus jagataks eraldi teenusteks (nt Autentimisteenus, Tootekataloogi teenus, Tellimuste teenus), mida saab sõltumatult skaleerida. Andmed viidaks päris andmebaasidesse (nt PostgreSQL relatsiooniliste andmete ja Redis vahemällu puhverdamise jaoks). Liikluse jaotamiseks lisataks koormusjaoturid (Load Balancers).

## GitHub Actions

GitHub Actions on seadistatud failis `.github/workflows/ci.yml`. See on automaatne CI (Continuous Integration) pipeline, mis käivitub iga kord, kui kood lükatakse (push) `main` harusse või tehakse Pull Request.

Protsess teeb automaatselt järgmist:
1. Kloonib uusima koodi serverisse.
2. Seadistab Node.js (versioon 20) keskkonna.
3. Tõmbab alla kõik vajalikud npm paketid (`npm install`).
4. Käivitab testserveri taustal.
5. Käivitab automaattestid (`node src/test.js`), et kontrollida, kas kõik 11 testi läbivad edukalt. Kui mõni test ebaõnnestub, märgib GitHub Actions koodi vigaseks ega lase seda live-keskkonda.
