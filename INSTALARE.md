# Grădinărit – cum o pui pe telefon

Aplicația trebuie pusă pe internet (gratuit, pe GitHub Pages) ca s-o poți instala din Chrome pe Android. Durează cam 10 minute, o singură dată.

## 1. Pune aplicația pe GitHub Pages

1. Fă-ți cont gratuit pe **https://github.com** (dacă nu ai).
2. Apasă **+** (sus, dreapta) → **New repository**.
   - Repository name: `gradinarit`
   - Bifează **Public**
   - Apasă **Create repository**.
3. Pe pagina nouă apasă linkul **uploading an existing file**.
4. Dezarhivează fișierul `gradinarit.zip` pe calculator și **trage tot conținutul folderului** (`index.html`, `sw.js`, `manifest.webmanifest` și folderele `css`, `js`, `icons`, `lib`) în fereastra GitHub. Apasă **Commit changes**.
   - Important: `index.html` trebuie să fie direct în repository, nu într-un subfolder.
5. Mergi la **Settings** → **Pages** (în meniul din stânga).
   - La **Branch** alege `main` și `/ (root)` → **Save**.
6. După 1–2 minute apare sus adresa aplicației, de forma:
   `https://NUMELE-TAU.github.io/NUMELE-REPO/` (exact cum se numește repo-ul, cu majuscule; la tine: `https://magdici-sorin-viorel.github.io/Gradinarit/`)

## 2. Instaleaz-o pe telefon (Android)

1. Deschide adresa de mai sus în **Chrome** pe telefon.
2. Apasă cele **3 puncte** (sus, dreapta) → **Instalează aplicația** (sau **Adaugă pe ecranul de pornire** → **Instalează**).
3. Aplicația apare cu iconița ei printre celelalte aplicații și se deschide pe tot ecranul, fără bara browserului.
4. Aplicația se deschide mereu pe **luna curentă**. Poți alege oricând altă lună ca să citești ce se face atunci.
5. După prima deschidere funcționează și **fără internet**. Pozele plantelor vin de pe Wikipedia: fiecare poză apare după ce ai deschis planta o dată cu internet, apoi rămâne salvată pe telefon.

## Bine de știut

- **Grădina mea** (plantele marcate) se salvează doar pe telefon. Dacă ștergi datele Chrome sau dezinstalezi aplicația, lista se pierde.
- **Actualizări**: dacă modifici ceva în fișiere, mărește numărul din `sw.js` (de ex. `gradina-banat-v5` → `gradina-banat-v6`) și urcă din nou fișierele pe GitHub. Telefonul ia versiunea nouă la următoarea deschidere (uneori după a doua).
- **Plante noi**: se adaugă în fișierele din `js/data/` (câte unul pe categorie), copiind modelul unei plante existente.
- **Surse**: fiecare plantă verificată are, la final, lista surselor folosite. Plantele care nu sunt încă verificate au scris asta în detalii.
