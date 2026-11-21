# Data Verification Audit Log

This document records the human verification status for all telephone numbers, official sources, and emergency facilities referenced in Xahay. In accordance with the **Honest Data** product principle, no real-world fact or telephone number may be assumed without explicit source attribution and human verification.

## Emergency Helplines Status

|  Number  | Service Scope                 | Official Stated Source           | Last Checked |     Human Verification Status     |
| :------: | :---------------------------- | :------------------------------- | :----------: | :-------------------------------: |
| **112**  | National All-in-One Emergency | Ministry of Home Affairs (ERSS)  |  2026-11-20  | ⚠️ Flagged for Human Verification |
| **100**  | Police Emergency Control      | State Police Emergency Directory |  2026-11-20  | ⚠️ Flagged for Human Verification |
| **101**  | Fire and Rescue Services      | State Fire Services Directorate  |  2026-11-20  | ⚠️ Flagged for Human Verification |
| **108**  | Emergency Ambulance Service   | National Health Mission Assam    |  2026-11-20  | ⚠️ Flagged for Human Verification |
| **1070** | State Disaster Control Room   | ASDMA Official Portal            |  2026-11-20  | ⚠️ Flagged for Human Verification |
| **1077** | District Emergency Operations | DDMA District Toll-Free System   |  2026-11-20  | ⚠️ Flagged for Human Verification |

> **Audit Policy:**
>
> 1. All numbers above are standard official government emergency numbers. Prior to physical community field deployment or live operational use in any district, every number must be voice-tested and verified by an authorized team member.
> 2. No other phone numbers may be introduced without being verified and logged in this registry.

## Facilities & Shelters Verification

- **Relief Camps & Shelters:** All shelters currently loaded in `src/data/shelters.json` carry `"isDemo": true` and use sanitized placeholder naming (e.g. `Sample Relief Camp A`).
- **Hospitals:** All medical facilities in the seed dataset are labelled as demo data (`isDemo: true`) to prevent misdirection during real disasters. Real hospital registries must be validated with respective District Health Societies before removing the `isDemo` flag.
