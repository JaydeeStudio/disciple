# Security Specification - Quel disciple suis-je ?

## 1. Data Invariants
- A `TestResult` must belong to the authenticated user who created it (`userId == request.auth.uid`).
- A `User` profile can only be modified by the user themselves.
- Users can read their own test results but not others'.
- `createdAt` is immutable.

## 2. The "Dirty Dozen" Payloads (Deny Cases)
1. Creating a `User` profile with someone else's UID.
2. Updating a `User` profile's `email` or `uid`.
3. Creating a `TestResult` for another `userId`.
4. Updating an existing `TestResult` (results should be immutable once saved).
5. Reading `TestResult` where `userId != request.auth.uid`.
6. Reading `User` profile where `userId != request.auth.uid` (private PII).
7. Injecting a massive string into `displayName`.
8. Setting `createdAt` to a future or past date (must use `request.time`).
9. Creating a result without mandatory scores.
10. Listing all `testResults` without a filter on `userId`.
11. Deleting a `TestResult` (for now, let's say they are kept for history, or allow self-delete).
12. Attempting to update `archetypeKey` after creation.

## 3. Test Runner (Conceptual)
Tests will verify that `request.auth.uid` matches the `userId` in `TestResult` and that `User` profiles are isolated.
