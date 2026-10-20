# Audit of Wizards of the Coast D&D Campaign Books

**Purpose:** Establish a defensible quantitative baseline for planning *The Last Light of Netheril*, a proposed 256-page campaign written for the 2024 D&D rules.

**Audit status:** Initial desk audit and measurement protocol. This is not yet a full-text statistical audit of every WotC adventure. Public product listings establish publication metadata and some structural facts, but they do not provide enough legally accessible full-book text to calculate a reliable corpus-wide mean words per page. Where the evidence does not support a numeric metric, this report labels it as unmeasured rather than estimating it.

**Last reviewed:** 20 October 2026.

## Executive findings

1. **“Words per page” must be split into at least two metrics.** Total extracted words divided by printed pages measures overall book density, including low-text pages. Words on text-bearing pages measures prose density more directly. Neither should be used alone.
2. **A single WotC average would conceal major differences.** A hardcover campaign, a short starter adventure, an anthology, and a rules-heavy supplement have different content mixes. Sample them separately.
3. **The public evidence gathered for this initial audit does not support a rigorous numeric WotC average.** Retail page counts and descriptions are not a substitute for the actual text. No corpus-wide word-count figure is claimed here.
4. **For the 256-page Netheril project, plan by page function and content mix, then validate against a legally obtained sample corpus.** Do not set a rigid words-per-page quota before measuring the chosen reference books.
5. **Editorial usability should be measured as well as length.** Useful measures include pages per chapter, encounter count, words per encounter, boxed-text share, table density, stat-block share, navigation aids, and how often a DM must look elsewhere to run a scene.

## Scope and source quality

The target corpus is official Wizards of the Coast D&D adventure/campaign books, prioritizing fifth edition (2014 rules era) and the revised 2024 rules era. Anthologies and starter-set adventures are useful comparison groups, but should not be pooled blindly with full-length campaigns.

### Publicly verifiable reference points

| Title / source | What the source supports | Use in this audit | Limitation |
|---|---|---|---|
| *Vecna: Eve of Ruin* | Hasbro's 2024 announcement identifies it as an adventure campaign for characters of levels 10–20, released May 21, 2024. [Source](https://investor.hasbro.com/node/36261/pdf) | High-level, multi-setting campaign comparator | The announcement does not give a word count or page-density data. |
| *Lost Mine of Phandelver* | RPGnet's review identifies the Starter Set adventure as 64 pages within a 96-page box set. [Source](https://dev.rpg.net/reviews/view-printable.phtml?reviewNumber=16147) | Short introductory adventure comparator | Secondary source; page count is not a text count. |
| *The Crooked Moon* | D&D Beyond Marketplace describes a 632-page third-party 2024-rules-compatible bundle, including an adventure campaign, setting, monsters, and other content. [Source](https://marketplace.dndbeyond.com/settings/CB8NCKVST) | Not part of the WotC sample; useful only as an external format comparison | Third-party product and multi-component bundle; do not include in WotC averages. |
| D&D Beyond, “Let’s Design an Adventure: Outlines and Frameworks” | Recommends page-by-page planning for large works involving many encounters and art assets. [Source](https://www.dndbeyond.com/posts/623-lets-design-an-adventure-outlines-and-frameworks) | Supports a page-budget and asset-planning workflow | Advice article, not a quantitative analysis of published books. |
| D&D Beyond, “Let’s Design an Adventure: Thinking Like a Designer” | Discusses layout as a usability issue and recommends headings, subheadings, and visual signposting. [Source](https://www.dndbeyond.com/posts/753-lets-design-an-adventure-thinking-like-a-designer) | Supports usability measures | Advice article, not a word-count dataset. |
| D&D Beyond, “Creating Your First Campaign Using the 2024 Dungeon Master's Guide” | Describes the 2024 DMG campaign-planning structure and the use of conflicts, character arcs, and serialized connections. [Source](https://www.dndbeyond.com/posts/1850-creating-your-first-campaign-using-the-2024) | Reference for organizing the 2024-rules campaign workflow | Does not provide adventure-book density data. |

These sources establish useful context but **do not establish a WotC words-per-page average**. That figure requires text extraction and page classification from a defined sample of books.

## Recommended sample design

Use a stratified sample rather than a convenience sample. A strong first pass would include at least six WotC titles, with full text obtained from legitimately purchased digital editions or personal scans where permitted.

| Stratum | Candidate titles | Why include it |
|---|---|---|
| Long-form campaign | *Curse of Strahd*; *Storm King's Thunder*; *Tomb of Annihilation* | Measures the traditional hardcover campaign format across different structures. |
| Modern high-level campaign | *Vecna: Eve of Ruin* | Tests a multi-setting, high-level campaign structure. |
| Adventure anthology | *Ghosts of Saltmarsh*; *Tales from the Yawning Portal* | Shows how separately structured adventures and shared appendices affect density. |
| Introductory adventure | *Lost Mine of Phandelver* | Provides a smaller, onboarding-focused comparison. |
| Revised-rules era | Any WotC 2024-rules-era adventure available in full text | Allows a direct comparison of current conventions, rather than assuming the 2014-era format is unchanged. |

This is a proposed sample, not a claim that every listed book has already been measured. Record edition, printing, ISBN/product identifier, page count, and source file for each book. Do not combine third-party books with the WotC sample.

## Metrics to collect

### 1. Length and density

| Metric | Definition | Why it matters |
|---|---|---|
| Total words per printed page | Extracted words ÷ printed page count | Measures overall density, including art, maps, blank pages, and appendices. |
| Words per text-bearing page | Extracted words on pages classified as text-bearing ÷ number of text-bearing pages | Better indicator of the density a reader sees on prose-heavy pages. |
| Median words per text-bearing page | Median page word count among text-bearing pages | Less distorted by unusually dense appendices or stat blocks. |
| 10th / 90th percentile page words | Page word-count percentiles | Shows the range between sparse and dense pages. |
| Words by section | Words attributed to introduction, chapters, appendices, stat blocks, etc. | Reveals where book length is spent. |
| Words per chapter | Total chapter words and median chapter words | Helps budget a campaign of multiple chapters. |
| Words per encounter | Encounter-section words ÷ number of identifiable encounters | Useful for estimating prep and table-facing detail. |

**Important counting rule:** define whether tables, stat blocks, captions, headers, footers, running titles, and repeated legal text count as words. Keep both a raw extraction count and a cleaned count. Report the method with every result.

### 2. Page composition

For every printed page, classify the dominant content and, where practical, record approximate area share:

- Narrative / explanatory prose
- Boxed read-aloud text
- Encounters and tactical instructions
- NPC and monster statistics
- Tables and reference lists
- Maps and diagrams
- Full-page or half-page illustration
- Chapter opener / title page
- Appendix / rules reference
- Blank or intentionally sparse page

Then calculate the percentage of pages in each class, the percentage of total words in each class, and the number of pages that combine multiple classes. These metrics help explain why raw words per page differ across books.

### 3. Adventure structure

Track:

- Number of chapters and major sections
- Number of scenes, locations, and keyed areas
- Number of encounters, divided into combat, social, exploration, and mixed
- Number of explicit branching decisions and alternate outcomes
- Number of clues, secrets, handouts, puzzles, traps, and environmental hazards
- Number of NPCs with full statistics versus narrative-only entries
- Number of custom monsters, magic items, spells, and other rules elements
- Number of maps and player-facing handouts
- Number and type of appendices
- Level range, expected party level, and stated milestone / advancement approach

These counts are more actionable than word count alone: two books with similar word totals may deliver very different amounts of runnable adventure.

### 4. DM usability

Some measures require a structured human review rather than automated extraction:

- **Run-ready encounter rate:** percentage of encounters with objective, setup, relevant creatures/NPCs, terrain or circumstances, likely outcomes, and rewards/consequences stated clearly enough to run.
- **Cross-reference burden:** number of references that require the DM to consult another page or book to resolve a typical scene.
- **Navigation density:** number of useful headings, callouts, tables, and quick-reference elements per chapter.
- **Decision visibility:** how clearly the text distinguishes what is fixed, what is likely, and what changes based on player action.
- **Read-aloud separation:** whether player-facing text is clearly separated from DM-only information.
- **Recovery support:** whether the adventure supplies ways to continue if players miss a clue, refuse a hook, defeat an NPC early, or bypass an intended scene.
- **Continuity burden:** number of facts, clues, and consequences the DM must track across chapters.

For each qualitative score, use a defined rubric (for example 0–2 or 0–3) and preserve examples/notes. Do not present subjective ratings as objective measurements.

## Reproducible measurement protocol

### Step 1 — Freeze the sample

Create a register containing title, publisher, edition, publication year, ISBN or product ID, printed page count, file format, source provenance, and the date measured. Use one edition per title unless comparing editions is an explicit goal.

### Step 2 — Obtain permitted source files

Use legally acquired digital copies or scans made and used in compliance with applicable law and the book's terms. Public previews can be measured, but label them as previews and do not treat their density as representative of the complete book. Do not use unofficial full-book downloads as the basis for the audit.

### Step 3 — Extract text page by page

Use a PDF text extractor on files you are entitled to analyze. Preserve page boundaries and the printed page number where possible. If a PDF has no usable text layer, OCR can be used, but record the OCR engine and manually inspect a sample for errors. Tables and stat blocks often need cleanup.

### Step 4 — Clean and classify

Remove repeated running headers and footers for the cleaned count; retain them in the raw count. Decide consistently how to count stat-block abbreviations, dice expressions, table cells, page numbers, and hyphenated words. Classify pages by content. Mark image-only pages and pages with no extracted text instead of silently dropping them.

### Step 5 — Calculate results

For each book, publish:
- Raw extracted words
- Cleaned word count
- Printed page count
- Pages with extractable text
- Text-bearing page count
- Mean, median, 10th percentile, and 90th percentile words per text-bearing page
- Total words per printed page
- Section-level word counts
- Page-composition percentages
- Extraction / OCR limitations

Then calculate both the **mean of per-book metrics** and the **pooled metric across all sampled pages**. These answer different questions and should not be conflated. Report the sample size and dispersion; avoid implying the sample represents every WotC publication.

### Step 6 — Validate manually

Choose a random subset of pages from each book and compare the extraction against the page image. Check that text in callout boxes, tables, stat blocks, captions, and sidebars was not omitted or duplicated. Document the discrepancy rate.

## Proposed data schema

One row per book:

| Field | Example / format |
|---|---|
| title | Curse of Strahd |
| edition_year | 2016 |
| rules_era | 2014 / revised 2024 |
| book_type | campaign / anthology / starter |
| printed_pages | integer |
| raw_words | integer |
| clean_words | integer |
| text_bearing_pages | integer |
| mean_words_text_pages | decimal |
| median_words_text_pages | decimal |
| words_per_printed_page | decimal |
| chapter_count | integer |
| encounter_count | integer |
| map_count | integer |
| stat_block_count | integer |
| boxed_text_words | integer |
| appendix_words | integer |
| extraction_method | PDF text / OCR / manual |
| limitations | free text |
| source_reference | URL or private source identifier |

One row per page should additionally include book ID, printed page number, raw and cleaned word counts, page type, estimated art/map area, boxed-text word count, table presence, stat-block presence, and extraction confidence.

## What this means for *The Last Light of Netheril*

The current planning target is 256 pages:

| Section | Planned pages |
|---|---:|
| Front matter and campaign guide | 24 |
| Chapter I — Faerûn, level 5 | 24 |
| Chapter II — Netheril, level 11 | 28 |
| Chapter III — Faerûn, level 6 | 24 |
| Chapter IV — Netheril, level 12 | 28 |
| Chapter V — Faerûn, level 7 | 24 |
| Chapter VI — Netheril, level 13 | 32 |
| Chapter VII — Place Between Times | 36 |
| Appendices | 36 |
| **Total** | **256** |

Do not translate those pages into a total word target until the reference corpus has been measured. Instead, allocate each chapter's pages among prose, encounters, maps, art, tables, read-aloud blocks, and reference material. Once measured, use the sample's median text-bearing-page density as a planning benchmark, with separate assumptions for stat blocks, tables, and illustrated pages.

For a dual-timeline campaign, add campaign-specific metrics:
- Number of past actions with a documented present-day consequence
- Number of present-day discoveries that recontextualize ancient events
- Number of cross-timeline clues and how many independent ways each can be found
- Number of NPCs, factions, objects, locations, and events that recur across eras
- Number of finale objectives that require contributions from both versions of the party
- Number of continuity dependencies per chapter

These measures are likely to be more valuable to this campaign than matching an average word count in isolation.

## Current conclusions and next steps

**Established:** The public sources support basic metadata and provide useful official design guidance, but they do not provide a defensible full-book WotC words-per-page average.

**Not yet measured:** corpus-wide words per page, page-type proportions, boxed-text share, words per encounter, chapter-length distribution, and other quantitative statistics. These should remain blank until the full-text sample is actually processed.

**Recommended next step:** select six to eight reference books, obtain lawful source files, and run the page-by-page extraction and classification protocol above. The resulting dataset should include a raw CSV, cleaned CSV, calculation script, and this report updated with actual results, sample sizes, limitations, and confidence notes.

The goal is not to imitate a publisher's page count by intuition. It is to build a transparent benchmark and use it to plan a manuscript that is readable, runnable, and appropriately paced.


## Raw findings update — public product data and online tables of contents

This section contains counts that can be verified from public official product listings and D&D Beyond contents pages. **It does not contain word-count results**, because the public pages inspected expose tables of contents and marketing descriptions, not the complete printable text of each book.

### Measured / confirmed from sources

| Book | Print pages | Main chapters | Appendices | Character levels | Data source |
|---|---:|---:|---:|---|---|
| *Curse of Strahd* | 256 | 15 | 6 | 1–10 | Official D&D Beyond product description and contents page. [Product](https://marketplace.dndbeyond.com/adventures/curse-of-strahd) · [Contents](https://www.dndbeyond.com/sources/dnd/cos) |
| *Storm King's Thunder* | 256 | 12 | 4 | 1–11 | Wizards Play Network confirms 256 pages; D&D Beyond contents page lists chapters and appendices. [WPN product page](https://wpn.wizards.com/en/products/storm-kings-thunder) · [Contents](https://www.dndbeyond.com/sources/dnd/skt) |
| *Tomb of Annihilation* | 256 | 5 | 6 | 1–11 (published catalog listing) | D&D Beyond contents page lists five chapters and six appendices; catalog listing gives page count and level range. [Contents](https://www.dndbeyond.com/sources/dnd/toa) · [Catalog](https://wiki.ryanmichaelcurry.com/content/wikipedia_en_all_maxi_2025-08/List_of_Dungeons_%26_Dragons_adventures) |
| *Vecna: Eve of Ruin* | 256 | 11 | 3 | 10–20 | Official D&D Store confirms 256 pages and levels; D&D Beyond contents page lists 11 chapters and three appendices. [Official product](https://dndstore.wizards.com/eu/en/product/924704/vecna-eve-of-ruin-digital-plus-physical-bundle) · [Contents](https://www.dndbeyond.com/sources/dnd/veor) |

**Simple averages for these four selected books:**
- Mean printed pages: **256**
- Median printed pages: **256**
- Total main chapters: **43**
- Mean main chapters per book: **10.75**
- Total appendices: **19**
- Mean appendices per book: **4.75**

These averages describe only this four-book sample; they are not an average for all WotC adventures.

### Raw word-count status

| Metric | Result |
|---|---|
| Full-book word count, each title above | Not available from the public pages inspected |
| Average words per printed page | Not measured |
| Average words per text-bearing page | Not measured |
| Average boxed read-aloud words per page | Not measured |
| Average words per chapter | Not measured |
| Average encounters per 100 pages | Not measured |

Do not derive word counts by multiplying pages by an assumed density. That would manufacture the central statistic this audit is meant to discover.

### What is now established

- In this sample, full-length campaign books consistently use **256 printed pages**, even though their chapter structures differ substantially.
- The sample ranges from **5 chapters** (*Tomb of Annihilation*) to **15 chapters** (*Curse of Strahd*).
- The sample ranges from **3 appendices** (*Vecna: Eve of Ruin*) to **6 appendices** (*Curse of Strahd* and *Tomb of Annihilation*).
- Chapter count alone is not a proxy for word count: the chapter units vary from broad regional toolkits to individual set-piece adventures.
- The actual word-count audit still requires complete text-bearing page data from source files. Public contents pages do not provide it.
