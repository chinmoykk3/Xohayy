# Accessibility & Contrast Audit Report (WCAG 2.2 AA)

This report verifies all design token pairs against WCAG 2.2 AA requirements (4.5:1 for body and normal text, 3:1 for focus indicators and large text).

| Token Pair | Foreground | Background | Measured Ratio | Required Ratio | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Body Text on Page Background | `#0F172A` | `#F7FAFC` | **17.03:1** | 4.5:1 | ✅ PASS |
| Body Text on Card Background | `#0F172A` | `#FFFFFF` | **17.85:1** | 4.5:1 | ✅ PASS |
| Muted Text on Page Background | `#334155` | `#F7FAFC` | **9.88:1** | 4.5:1 | ✅ PASS |
| Muted Text on Card Background | `#334155` | `#FFFFFF` | **10.35:1** | 4.5:1 | ✅ PASS |
| Placeholder Text on Card Background | `#475569` | `#FFFFFF` | **7.58:1** | 4.5:1 | ✅ PASS |
| Emergency Button Text on Emergency Red | `#FFFFFF` | `#B91C1C` | **6.47:1** | 4.5:1 | ✅ PASS |
| Primary Button Text on Primary Sky-Blue | `#FFFFFF` | `#0369A1` | **5.93:1** | 4.5:1 | ✅ PASS |
| Risk Low (Green) Text on Background | `#14532D` | `#DCFCE7` | **8.3:1** | 4.5:1 | ✅ PASS |
| Risk Watch (Yellow) Text on Background | `#713F12` | `#FEF9C3` | **8.07:1** | 4.5:1 | ✅ PASS |
| Risk Warning (Orange) Text on Background | `#7C2D12` | `#FFEDD5` | **8.18:1** | 4.5:1 | ✅ PASS |
| Risk Danger (Red) Text on Background | `#7F1D1D` | `#FEE2E2` | **8.2:1** | 4.5:1 | ✅ PASS |
| Focus Ring on Page Background | `#0284C7` | `#F7FAFC` | **3.91:1** | 3:1 | ✅ PASS |
| Focus Ring on Card Background | `#0284C7` | `#FFFFFF` | **4.1:1** | 3:1 | ✅ PASS |
| High Contrast Text on High Contrast Background | `#000000` | `#FFFFFF` | **21:1** | 7:1 | ✅ PASS |

*All measurements generated automatically by `tests/unit/contrast.test.ts` via `src/lib/contrast.ts`.*
