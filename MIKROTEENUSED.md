# Monoliidist Mikroteenusteni (Monolith to Microservices)

Käesolevas dokumendis on näidatud, kuidas näeks välja `veebipood` projekti failistruktuur ja arhitektuur, kui läheksime üle algsest monoliidist (kõik kood ühes rakenduses) kaasaegsele mikroteenuste (Microservices) arhitektuurile.

## Projekti struktuur

Kui rakendus ehitatakse ringi mikroteenusteks, jagatakse koodibaas eraldi iseseisvateks teenusteks:

```text
veebipood/
├── monolith/                        # Vana monoliit — kõik ühes rakenduses
├── microservices/                   # Mikroteenused — eraldi iseseisvad teenused
│   ├── users/                       # Kasutajate teenus (port 5051)
│   ├── products/                    # Toodete teenus (port 5052)
│   ├── orders/                      # Tellimuste teenus (port 5053)
│   └── gateway/                     # API Gateway / Veebileht (port 5070)
├── docker-compose.monolith.yml      # Skript vana monoliidi käivitamiseks
├── docker-compose.microservices.yml # Skript uute mikroteenuste käivitamiseks
├── README.md                        # Projekti üldine dokumentatsioon
└── MIKROTEENUSED.md                 # Käesolev mikroteenuste juhend (sina oled siin)
```

## Teenuste kirjeldused

Mikroteenuste puhul on iga teenus eraldiseisev Node.js rakendus, millel on oma `package.json`, oma andmebaas ning mis käivitatakse iseseisvas Docker konteineris.

### 1. `gateway/` (port 5070)
* **Roll:** API Gateway ehk ainus avalik sissepääsupunkt klientidele (brauseritele ja mobiiliäppidele).
* **Vastutus:** Suunab sissetulevad API päringud edasi õigele siseteenusele. Näiteks päringu `/api/products` suunab ta edasi `products/` mikroteenusele. Vajadusel tegeleb ka autentimismärkide (Token) esmase valideerimise ja koormuse jaotamisega (Load Balancing).

### 2. `users/` (port 5051)
* **Roll:** Kasutajate haldus, registreerimine ja autentimine.
* **Vastutus:** Haldab `/api/users/*` päringuid. Salvestab ja kontrollib kasutajanimesid ja paroole oma isiklikus andmebaasis. Eduka sisselogimise korral väljastab JWT (JSON Web Token) märke.

### 3. `products/` (port 5052)
* **Roll:** Toodete kataloog, otsing ja laoseisu haldus.
* **Vastutus:** Haldab `/api/products/*` päringuid. Tagastab toodete nimekirju ja filtreerib neid kategooria ning nime järgi.

### 4. `orders/` (port 5053)
* **Roll:** Ostukorvi ja tellimuste töötlemine.
* **Vastutus:** Haldab `/api/orders/*` päringuid. Uue tellimuse tegemisel peab see teenus tegema sisevõrgu kaudu HTTP päringu `products/` teenusele (et broneerida laoseis) ning `users/` teenusele (kui on vaja kasutaja detaile).

## Peamised erinevused: Monoliit vs Mikroteenused

| Omadus | Monoliit (praegune süsteem) | Mikroteenused (uus süsteem) |
|---|---|---|
| **Koodibaas** | Kõik loogika asub koos ühes rakenduses (`server.js`). | Kood on jagatud mitme väikese rakenduse vahel. |
| **Andmebaas** | Üks ühine `data.js` mälus kõikidele andmetele. | Igal teenusel on **oma andmebaas**. Üks teenus ei saa teise teenuse andmebaasi otse lugeda ega muuta. |
| **Omavaheline suhtlus** | Kiired funktsiooni väljakutsed (nt `require("../data")`). | Aeglasem suhtlus üle võrgu (HTTP API päringud või sõnumijärjekorrad nagu Kafka). |
| **Skaleerimine** | Suure koormuse puhul kopeeritakse kogu suurt rakendust. | Kui poel on näiteks kampaania tõttu palju toodete otsinguid, saab suurendada **ainult** `products/` teenuse ressurssi, säästes serveri jõudlust. |
| **Veakindlus** | Kui `server.js` kokku jookseb (näiteks tellimuse töötlemise vea tõttu), siis ei tööta terves veebipoes enam mitte miski. | Kui tellimuste teenus jookseb kokku, saavad inimesed endiselt sisse logida ja tooteid vaadata, sest need teenused töötavad iseseisvalt edasi. |
