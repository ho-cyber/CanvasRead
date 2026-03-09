
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** CanvasRead
- **Date:** 2026-03-08
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC003 Invalid URL validation blocks scrape and shows error message
- **Test Code:** [TC003_Invalid_URL_validation_blocks_scrape_and_shows_error_message.py](./TC003_Invalid_URL_validation_blocks_scrape_and_shows_error_message.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Website URL input field not found on landing page at /.
- "Start Scrape" button not found on landing page; cannot initiate scrape action.
- URL validation behavior could not be tested because required input and controls are missing.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/0ab8f95f-60b5-49d5-9d70-278ce3f3a14a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Empty URL submission shows required/validation message
- **Test Code:** [TC004_Empty_URL_submission_shows_requiredvalidation_message.py](./TC004_Empty_URL_submission_shows_requiredvalidation_message.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- 'Start Scrape' button not found on page
- Could not verify presence of validation message 'invalid URL' because scraping feature is not available
- Could not verify that 'Progress' is not visible because scraping was not initiated

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/e660a906-047b-4591-a920-5588269bd6d9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 No-meaningful-changes fallback notice appears for Three.js canvas pages and finishes with warning plus retry option
- **Test Code:** [TC005_No_meaningful_changes_fallback_notice_appears_for_Three.js_canvas_pages_and_finishes_with_warning_plus_retry_option.py](./TC005_No_meaningful_changes_fallback_notice_appears_for_Three.js_canvas_pages_and_finishes_with_warning_plus_retry_option.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- /demo returned 404 and displayed 'This page could not be found.'
- Demo route is unavailable, so the live demo workflow (enter URL, select interaction mode, Start Scrape) cannot be executed
- Cannot verify the fallback messaging ('no meaningful changes detected', 'full-page', 'Retry') because the demo page is not reachable

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/cf787dd9-43f2-4e5d-9def-d15a690fbb90
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Meaningful change event is emitted when threshold + debounce conditions are met
- **Test Code:** [TC006_Meaningful_change_event_is_emitted_when_threshold__debounce_conditions_are_met.py](./TC006_Meaningful_change_event_is_emitted_when_threshold__debounce_conditions_are_met.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Demo page '/demo' returned a 404 with the message 'This page could not be found.'
- Target UI elements required for the test ('Target URL' input and 'Start' button) are not present because the page content is a 404 error.
- No interactive elements are available on the /demo page (0 interactive elements), preventing further automated interactions.
- Previous attempts to open the demo via the landing page's 'Try Live Demo' link did not result in a functional demo page load.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/682fc5e6-1168-4df1-b541-a8f50c20c851
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Cross-origin canvas buffer access failure falls back to screenshot mode and is communicated to the UI
- **Test Code:** [TC008_Cross_origin_canvas_buffer_access_failure_falls_back_to_screenshot_mode_and_is_communicated_to_the_UI.py](./TC008_Cross_origin_canvas_buffer_access_failure_falls_back_to_screenshot_mode_and_is_communicated_to_the_UI.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Demo dashboard not found: /demo returns 404 'This page could not be found.'
- Target URL input field not present on the page, preventing entry of 'https://maps.google.com'
- Start button not present on the page, preventing the demo from being started
- Required UI messages ('Canvas buffer access blocked', 'Using screenshot fallback', 'May be inaccurate') were not displayed and could not be verified

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/04ea3dfa-0e4e-4ef6-b974-5cd2be68ea4d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Real-time extraction preview updates after a canvas change event
- **Test Code:** [TC010_Real_time_extraction_preview_updates_after_a_canvas_change_event.py](./TC010_Real_time_extraction_preview_updates_after_a_canvas_change_event.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Demo page '/demo' returned 404: page displays 'This page could not be found.'
- No interactive elements available on /demo (0 interactive elements), so UI behavior cannot be exercised.
- Attempts to open the demo via the 'Try Live Demo' click did not produce the expected dashboard UI; navigation to a working demo did not occur.
- Extraction preview, 'Start/Run' controls, 'Running' status, and JSON-like extraction output could not be verified because the demo page is unavailable.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/13788911-147e-4c2b-b64a-bbd2fbefeac8
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Token counter increments when new structured results are published
- **Test Code:** [TC011_Token_counter_increments_when_new_structured_results_are_published.py](./TC011_Token_counter_increments_when_new_structured_results_are_published.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Demo page at /demo returned HTTP 404 and displayed 'This page could not be found.'
- Token counter element not present because the demo dashboard page did not load.
- Start/Run control to begin scraping is not available due to the missing dashboard page.
- Real-time token counter updates could not be verified because the dashboard could not be accessed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/09f2973c-d8b6-40f6-8679-5880086322be
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 UI indicates a snap failure after repeated invalid (non-JSON) model output
- **Test Code:** [TC012_UI_indicates_a_snap_failure_after_repeated_invalid_non_JSON_model_output.py](./TC012_UI_indicates_a_snap_failure_after_repeated_invalid_non_JSON_model_output.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Demo dashboard page at /demo returned 404 with message 'This page could not be found.'
- Demo UI (Start/Run button and pipeline run interface) is not reachable because /demo returns 404, so the pipeline behavior cannot be tested.
- Attempts to open the demo from the landing page did not result in the demo dashboard being loaded, preventing further verification steps.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/34a4588f-74b5-4d6e-8ae9-0582ba3081bb
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Low-confidence results are flagged for manual review and still allow other items to merge
- **Test Code:** [TC014_Low_confidence_results_are_flagged_for_manual_review_and_still_allow_other_items_to_merge.py](./TC014_Low_confidence_results_are_flagged_for_manual_review_and_still_allow_other_items_to_merge.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Demo page '/demo' returned HTTP 404 with message 'This page could not be found.'
- Extraction/demo UI is not present on /demo, preventing verification of 'Manual review', 'Extraction preview', and 'labels'.
- 'Try Live Demo' CTA did not lead to a working demo; the demo endpoint is unavailable.
- Rate limiting on /demo could not be tested because the demo endpoint is inaccessible.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/58cdc47b-6d0e-4e6e-843a-bf155673ee90
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Run Demo Mode pipeline from Demo Tile #1 and view final JSON output
- **Test Code:** [TC017_Run_Demo_Mode_pipeline_from_Demo_Tile_1_and_view_final_JSON_output.py](./TC017_Run_Demo_Mode_pipeline_from_Demo_Tile_1_and_view_final_JSON_output.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Demo dashboard not found - HTTP 404 displayed on /demo.
- 'Start Scrape' button not present on page; unable to start demo scrape.
- Prefilled demo URL/mode not visible on dashboard; cannot verify pre-populated input.
- Pipeline indicators ('Token', 'Snaps', 'JSON', 'Total') not found due to missing dashboard page.
- Rate limiting status on /demo could not be verified because the demo page is inaccessible.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/a410205e-c55b-4494-ade7-62489d102de7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Run Demo Mode pipeline from Demo Tile #2 and verify output appears
- **Test Code:** [TC018_Run_Demo_Mode_pipeline_from_Demo_Tile_2_and_verify_output_appears.py](./TC018_Run_Demo_Mode_pipeline_from_Demo_Tile_2_and_verify_output_appears.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Demo tile labeled 'Demo 2' not found on the landing page (no interactive element with that label present).
- 'Try Live Demo' link previously navigated to /demo which displayed a 404 page.
- The /demo page contained no interactive elements, preventing access to a demo dashboard to verify pre-populated settings or run a scrape.
- Unable to verify pre-populated demo URL, 'Start Scrape' button behavior, or visibility of 'Token', 'JSON', and 'Total' because the demo dashboard is inaccessible.
- Landing page appears to expose feature cards and anchor links only; a second curated demo tile interface is not present to be tested.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/eddb907f-51cd-45c0-9fd3-d42e4e7ae980
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Token counter is visible while pipeline is running in demo mode
- **Test Code:** [TC020_Token_counter_is_visible_while_pipeline_is_running_in_demo_mode.py](./TC020_Token_counter_is_visible_while_pipeline_is_running_in_demo_mode.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Demo page /demo returned HTTP 404 with content '404 This page could not be found.', so the demo dashboard is not reachable.
- 'Start Scrape' control not present on /demo (no interactive elements detected), therefore the token counter feature cannot be started or observed and live feedback cannot be verified.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/fe4db599-53df-4dea-b408-4b354c4c2695
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Demo site load failure shows a demo load error message
- **Test Code:** [TC022_Demo_site_load_failure_shows_a_demo_load_error_message.py](./TC022_Demo_site_load_failure_shows_a_demo_load_error_message.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Demo tile labeled "Demo 3" not found on the landing page; no clickable tile available to open the demo dashboard.
- "Start Scrape" button not found on the landing page or within available interactive elements; cannot initiate a demo scrape.
- Demo dashboard at /demo cannot be reached via the visible navigation elements on the landing page, so the demo load error state cannot be exercised or verified.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/d5351a3f-929d-4ce5-8d52-420bf85d3cfe
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 From demo load error, user can try the next demo option
- **Test Code:** [TC023_From_demo_load_error_user_can_try_the_next_demo_option.py](./TC023_From_demo_load_error_user_can_try_the_next_demo_option.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Demo dashboard not reachable — clicking 'Try Live Demo' did not navigate to /demo and the landing page remains displayed.
- Demo tile labeled 'Demo 3' not found on the landing page or any accessible UI; no element matching 'Demo 3' is available to click.
- The 'Start Scrape' button is not present on any accessible page, so a demo load error could not be triggered or observed.
- Rate limiting on /demo could not be verified because the demo dashboard could not be reached.
- No alternative navigation elements to reach a demo dashboard were found on the current page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/8822e1cb-f611-4c97-b2f7-d816f572b673
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 From demo load error, user can view pre-recorded demo output
- **Test Code:** [TC024_From_demo_load_error_user_can_view_pre_recorded_demo_output.py](./TC024_From_demo_load_error_user_can_view_pre_recorded_demo_output.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- ASSERTION: The demo page at /demo returns a 404 error and displays 'This page could not be found.'
- ASSERTION: The /demo page contains 0 interactive elements, so there is no way to interact with demo controls (e.g., 'Start Scrape').
- ASSERTION: The 'View pre-recorded output' control was not available on the landing page or the demo page, preventing access to the pre-recorded demo output.
- ASSERTION: It is not possible to verify the presence of 'JSON' or 'Total' because the pre-recorded output cannot be reached due to the demo endpoint returning 404.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/d7480175-e3c9-40f7-96d5-8817c93d17fc/d67b923d-d811-4bf0-9b7d-623da1d4de64
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---