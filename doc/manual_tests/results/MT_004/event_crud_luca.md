# Manual Test Report

**Date (YYYY-MM-DD):** 2026-04-26
**Tester:** Luca Ricci

**Test Name:** Event API Crud tests
**Test Steps (summary):**
  1. Setup Bruno or Postman Collection
  2. Fetch OAuth2.0 Bearer Token
  3. Fill out a JSON Body request (information dependent on which method is being used)
  4. Receieve output message and check DB to ensure data update

## Expected vs Actual
**Expected:** expected 201 messages signifying success in the test, and updating our database with
the appropriate method (post, put, delete).

**Actual:** Actual output matched up with expectations

## Outcome
**Pass/Fail:** Pass

## Evidence (logs / screenshots)
- docs/manual_tests/MT_003/create_api_test.jpg
- docs/manual_tests/MT_003/create_api_test_db.jpg
- docs/manual_tests/MT_003/rename_api_test.jpg
- docs/manual_tests/MT_003/rename_api_test_db.jpg
- docs/manual_tests/MT_003/deletion_api_test.jpg

## Next Steps (if needed)
- N/a
