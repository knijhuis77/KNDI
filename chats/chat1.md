# Koennijhuis Restyle

_Started 2026-05-28 13:25 UTC_

---

## User

Make a restyle of www.koennijhuis.nl using the same content. But use cool front-end stuff like parallax scrolling en motion design.

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: update_todos]_

I have a clear picture of the content and brand. Let me plan and build.

_[tool: copy_files]_

_[tool: write_file]_

Now I'll build the restyle. I'll make a bold motion-rich single-page experience with custom cursor, parallax, horizontal pin-scroll timeline, sticky-stack services, word-by-word reveals, and marquees.

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Restyled `www.koennijhuis.nl` into a single motion-rich page — same content & voice, new choreography.

**What's new vs. the original site**
- **Custom slash cursor** with two trailing dots (turns yellow on black sections)
- **Hero**: massive `DIGITAAL INNOVEREN.` translates left / `Maar hoe?` translates right as you scroll, photo + 22 background slashes parallax independently
- **Marquee strips** (one yellow→black, one reversed) of brand phrases & services
- **About**: sticky word-by-word reveal of the "Geen uren maar waarde" paragraph, with italic accent words ("is mijn talent") lighting up in yellow
- **CV**: pinned section with horizontal scroll-through of the six career rows on a yellow rail, with progress counter
- **Services**: sticky-stack of 6 cards (each peeks out below the next) with hard-offset shadows
- **Testimonial**: word-by-word reveal with giant background quote glyph
- **Contact**: animated underline form fields, magnetic CTA buttons, fade-to-success swap
- **Side index**, **top scroll-progress bar**, **header transition** (transparent → black at 80px), reduced-motion fallback throughout

All on `Website KNDI.html` — assets, fonts and motion logic live under `restyle/`.

## User

Verifier agent check completed

## User

Verifier agent check completed

## User

Verifier agent check completed

## Assistant

## User

Oh nee, dat is veel te veel. Maak hem maar mooi strak en professioneel. Het gaat om een innovatief persoon in de zakelijk markt die maatwerk software trajecten begeleid. Dat moet het uitstralen. De tijlijn mag qwel mooi horizontal met motiondesign zodat je er doorheen kunt scrollen.

## Assistant

_[tool: copy_files]_

Begrepen — strakker en professioneler, met de horizontale tijdlijn als het ene motion-moment. Ik bewaar de huidige als v1 en herzie.

_[tool: str_replace_edit]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: done]_

Klaar — strakke, professionele restyle met de horizontale tijdlijn als enige uitgesproken motion-moment.

**Wat is veranderd t.o.v. v1**
- Custom cursor, marqueeën, magnetic buttons, parallax slashes, sticky word-reveals — allemaal eruit
- Toon nu: executive consultancy, veel witruimte, dunne hairlines, gerichte gele accents
- Type discipline: één displayfont voor headlines, italic light voor de *"Maar hoe?"*-counter, monosafe voor labels
- Nieuwe **getallenstrip** (25+ jaar / 1 partner / 6 diensten / 0 belang) als rustige bewijslast
- Services nu een schone 3×2 grid met zwarte hover, geen stacked-card playfulness meer
- Klanten/footer/contact volledig opnieuw — vakwerkkaart-feel, geel uitsluitend als CTA-accent

**Het ene motion-moment**
- CV pint vast (`position: sticky`), tijdlijn schuift horizontaal mee terwijl je verticaal scrollt
- Lerp/inertia op de translateX zodat het zacht beweegt
- Items boven/onder de rail wisselen elkaar af; actieve kaart krijgt focus + node-glow
- Voortgangsbalk + `01 / 06` teller onderaan
- Op mobiel valt 'ie terug op natuurlijke horizontal touch-scroll

v1 staat veilig op `Website KNDI v1 (motion-heavy).html` als je later wil terugkijken.

