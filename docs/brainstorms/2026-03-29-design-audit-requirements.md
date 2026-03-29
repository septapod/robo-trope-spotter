---
date: 2026-03-29
topic: design-audit-fixes
---

# Design Audit Fixes

## Problem Frame

The app works functionally but the visual design has accumulated problems across the rapid build: visual noise from too many decorative blobs, competing typography, sections that run together without rhythm, and several small UX gaps (no favicon, dark OG image on a light app, no 404 page, too-small mobile touch targets). The audit identified 15 fixes across three severity phases.

## Requirements

**Visual Hierarchy and Layout**
- R1. Reduce the landing page title from text-7xl/8xl to text-4xl/5xl. Remove the gradient animation. The input area should be the dominant element.
- R2. Reduce background blobs to 2 subtle ones max. Remove all foreground decorative blobs on both pages.
- R3. Remove the "Original Text" heading. Show the highlighted text block directly after the DNA strip.
- R4. Add generous spacing (py-16) between major report sections so each reads as its own unit.

**Loading and Feedback**
- R5. Replace the static "Hunting for tropes..." loading text with a cycling sequence: "Reading the text...", "Scanning for patterns...", "Scoring the results..." at 3-second intervals.
- R6. Soften error states from red to warm amber/orange. Tone should be helpful, not alarming.

**Typography and Visual Consistency**
- R7. Drop Space Grotesk. Use Geist at black weight for display headings. Two fonts total: Geist + JetBrains Mono.
- R8. Make the DNA strip taller (h-10). Add small trope name labels below the top 3 widest bands.
- R9. Use body font (Geist) for quoted examples in trope cards, not monospace.
- R10. Replace the gradient analyze button with a solid candy-pink button.

**Shareability and Actions**
- R11. Make the share bar more prominent. Move share actions below the score hero, or make the nav share buttons larger.

**Polish**
- R12. Add a favicon (simple magnifying glass or "R" mark).
- R13. Update the OG image generator to use the light theme with candy colors instead of the dark theme.
- R14. Add a custom branded 404 page.
- R15. Increase mobile touch targets on URL/screenshot pill toggles to py-3 px-5 minimum.

## Success Criteria

- The landing page eye flow goes: subtitle, text area, button (not title first)
- The report page has clear visual breaks between score, highlighted text, and trope cards
- The app feels calmer and more confident with fewer competing visual elements
- Loading state keeps users engaged during the 5-15 second LLM wait
- OG image preview matches the actual light-theme app appearance

## Scope Boundaries

- No functionality changes. All fixes are visual/UX only.
- No new features. This is about making what exists feel polished.
- The candy color palette stays. This is refinement, not a redesign.

## Next Steps

All requirements are clear. No blocking questions.
-> /ce:plan for implementation planning, then /ce:work to execute.
