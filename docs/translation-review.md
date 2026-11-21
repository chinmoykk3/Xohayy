# Translation Review & Quality Assurance

> [!IMPORTANT]
> **Status**: Machine Drafts Requiring Native Speaker Field Verification
> All non-English UI strings (`src/i18n/as.json`, `src/i18n/hi.json`) and emergency guide instructions (`src/data/guides/*.as.json`, `src/data/guides/*.hi.json`) currently exist as **preliminary machine-generated drafts**. They have been structured according to official disaster terminology (ASDMA / NDMA) and validated for technical constraints (placeholders and word counts), but require formal review by native speakers before production disaster deployment.

---

## 1. Scope of Localized Content

| Asset Category                 | Target Locales                | Source / Reference                  | Constraint                                 |
| :----------------------------- | :---------------------------- | :---------------------------------- | :----------------------------------------- |
| **UI Strings**                 | Assamese (`as`), Hindi (`hi`) | `src/i18n/en.json`                  | 100% key parity, identical placeholders    |
| **Flood Evacuation Guide**     | Assamese (`as`), Hindi (`hi`) | `src/data/guides/flood.en.json`     | $\le$ 14 words per step, 1 action per step |
| **Landslide Evacuation Guide** | Assamese (`as`), Hindi (`hi`) | `src/data/guides/landslide.en.json` | $\le$ 14 words per step, 1 action per step |
| **Districts & Helplines**      | Assamese (`as`), Hindi (`hi`) | Official ASDMA listings             | Official names and script standards        |

---

## 2. Emergency Language Principles

1. **High-Stress Comprehension**: Keep instructions brief, unambiguous, and imperative (direct call to action).
2. **Strict Word Count**: Every emergency step must be strictly 14 words or fewer.
3. **Calm, Authoritative Tone**: No sensationalist phrasing; clear procedural instructions.
4. **Local Dialect Nuance**:
   - Assamese: Standard Eastern Indic script; respect flood-plain terminology (e.g., _বান সাহাৰ্য শিবিৰ_, _খহনীয়া_, _জলমগ্ন_).
   - Hindi: Devanagari script; standard public-safety lexicon understood across North East Hindi speakers.

---

## 3. Native Speaker Review Roster

The following roster documents community and authority reviewers verifying terminology and accessibility:

| Locale              | Target Content                        | Reviewer             | Qualification / Background                       | Status           | Date    |
| :------------------ | :------------------------------------ | :------------------- | :----------------------------------------------- | :--------------- | :------ |
| **Assamese (`as`)** | UI Strings (`as.json`)                | _Pending Assignment_ | Native Assamese Linguist / ASDMA Field Volunteer | 🟡 Machine Draft | Pending |
| **Assamese (`as`)** | Flood Guide (`flood.as.json`)         | _Pending Assignment_ | Native Speaker (Brahmaputra Valley)              | 🟡 Machine Draft | Pending |
| **Assamese (`as`)** | Landslide Guide (`landslide.as.json`) | _Pending Assignment_ | Native Speaker (Dima Hasao / Karbi Anglong)      | 🟡 Machine Draft | Pending |
| **Hindi (`hi`)**    | UI Strings (`hi.json`)                | _Pending Assignment_ | Native Hindi Speaker / Disaster Response Trainer | 🟡 Machine Draft | Pending |
| **Hindi (`hi`)**    | Flood Guide (`flood.hi.json`)         | _Pending Assignment_ | NDMA / SDRF Hindi Field Specialist               | 🟡 Machine Draft | Pending |
| **Hindi (`hi`)**    | Landslide Guide (`landslide.hi.json`) | _Pending Assignment_ | Native Hindi Disaster Response Specialist        | 🟡 Machine Draft | Pending |

---

## 4. Automated Verification Rules

Our continuous integration pipeline enforces the following automated checks on all translations (`tests/unit/i18n.test.ts`):

- **Key Parity**: Every key present in `en.json` must be present in `as.json` and `hi.json`. No missing keys are allowed.
- **Placeholder Consistency**: Placeholders like `{time}`, `{source}`, `{count}`, `{date}` must match across all languages without modification.
- **Length Constraint**: Guide step text is automatically measured and guaranteed to not exceed 14 words per step.
- **Safe Fallback**: Runtime helper `t()` safely falls back to English if any key is missing, avoiding crashes or broken layouts.
