# Scrum-prosessi ja tikettienhallinta — esitysmateriaali

Tämä dokumentti kuvaa, miten projekti on toteutettu Scrum-mallilla ja miten tikettityöskentelyä
on käytetty. Sisältö vastaa suoraan sovelluksen `seed.js`-esimerkkidataa, joten sama data on
näytettävissä livenä sovelluksesta esityksen aikana.

## 1. Työn pilkkominen tehtäviin

Projekti pilkottiin backlogiin, joka sisältää koko projektin toteutuksen tehtävät:

| # | Tehtävä | Prioriteetti |
|---|---|---|
| T-9 | Tietokantaskeeman suunnittelu | high |
| T-10 | Backend-rungon pystytys | high |
| T-11 | Tikettien CRUD-toiminnot | high |
| T-12 | Kommenttiominaisuus | medium |
| T-13 | React-käyttöliittymän viimeistely | medium |
| T-14 | ER-mallin dokumentointi | medium |
| T-15 | Esityksen kokoaminen | high |
| T-16 | Liitteiden lataus tiketteihin | low |

Backlogin tehtävät jaettiin kolmeen sprinttiin niiden riippuvuuksien mukaan: ensin perusrakenne,
sitten ydintoiminnallisuus, viimeiseksi viimeistely ja dokumentaatio.

## 2. Työn eteneminen vaiheittain (sprintit)

| Sprintti | Ajanjakso | Tavoite | Tila |
|---|---|---|---|
| Sprintti 1 — Perusrakenne | 1.–14.6. | Tietokantaskeema ja backend-runko pystyyn | Valmis |
| Sprintti 2 — Tiketit ja kommentit | 15.–28.6. | Ydintoiminnallisuus: tikettien CRUD, kommentit | Valmis |
| Sprintti 3 — Viimeistely ja demo | 29.6.–12.7. | Käyttöliittymän viimeistely, ER-malli, esitys | Käynnissä |

Kunkin sprintin lopussa pidettiin katselmointi, jossa tarkistettiin mitkä tiketit saatiin
tilaan **Valmis**, ja seuraavan sprintin sisältö suunniteltiin jäljellä olevan backlogin pohjalta.

## 3. Toteutetut kokonaisuudet

- **Sprintti 1**: tietokantarakenne (8 taulua, avaimet ja viittaukset), Express-palvelin ja
  peruslistaus-/hakureitit
- **Sprintti 2**: täydet CRUD-toiminnot tiketeille, tilan- ja prioriteetinvaihto,
  kommenttitoiminnallisuus
- **Sprintti 3**: Kanban-tikettitaulu raahaustoiminnolla, sprinttinäkymät, ER-mallin
  dokumentointi, tämä esitysmateriaali

## 4. Tikettienhallinnan käyttö

Sovellus itse toimii tikettityökaluna: jokainen kehitystehtävä on kirjattu tikettinä
(`tasks`-taulu) täsmälleen samalla rakenteella kuin loppukäyttäjän tikettiäkin — tiketillä on
otsikko, kuvaus, tila, prioriteetti, vastuuhenkilö, raportoija ja määräaika.

**Miten tehtävät on kirjattu:**
Jokainen työvaihe kirjattiin tiketiksi ennen työn aloitusta (`status: backlog` tai `todo`),
osoitettiin tiimin jäsenelle (`assignee_id`) ja liitettiin oikeaan sprinttiin (`sprint_id`).

**Miten niitä on käsitelty:**
Tiketin tilaa päivitettiin työn edetessä: `todo → in_progress → review → done`.
Esimerkiksi T-12 (Kommenttiominaisuus) on tällä hetkellä tilassa `in_progress`, ja siihen on
kirjattu kaksi työn etenemistä kuvaavaa kommenttia ("Kommenttien tallennus toimii, UI kesken." /
"Muista lisätä aikaleima kommentteihin.") — tämä havainnollistaa, miten kommentit toimivat
tiketin sisäisenä työlokina.

**Miten ne liittyvät projektin etenemiseen:**
Sprintin tikettien tilajakauma (kuinka monta backlogissa / työn alla / valmiina) kertoo suoraan
sprintin edistymisen — tämä on nähtävissä livenä sovelluksen tikettitaulussa valitsemalla
kyseinen sprintti navigaatiosta.

## 5. Esityksessä demottavaksi

1. Näytä tikettitaulu kokonaisuudessaan → selitä sarakkeet (Scrum-tilat)
2. Valitse "Sprintti 2" → näytä miten suodatus toimii ja mitä siinä sprintissä tehtiin
3. Avaa yksi tiketti (esim. T-12) → näytä kommenttihistoria työn etenemisen todisteena
4. Luo uusi tiketti livenä → osoita CRUD-toiminnallisuus
5. Näytä ER-malli ja selitä avainten/viittausten logiikka skeemaa vasten
