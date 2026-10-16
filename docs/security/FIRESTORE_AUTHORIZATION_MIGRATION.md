# Firestore authorization migration — TDBK-EDU

## Why this change exists

The previous `firestore.rules` allowed every caller to read and write all documents under `/institutions/{tenantId}/**`, including unauthenticated callers. This is unsafe for student, health, attendance, permissions, and financial data.

The proposed rules require an authenticated Firebase user whose trusted custom claim `tenantId` exactly matches the institution path.

## Required before merge or deployment

The current client code hardcodes `msa_academy_demo` and uses Firebase Auth, but this repository inspection did not find a trusted server-side process that provisions a `tenantId` custom claim. The app also seeds demo data from the client. Therefore, the rules change is intentionally **not production-ready by itself**.

1. Implement trusted server-side tenant membership provisioning. Never allow a client to set its own tenant claim.
2. Ensure every legitimate staff/parent account receives the correct claim only after membership verification. Revoke claims when membership ends.
3. Refresh ID tokens after claim changes and handle missing/mismatched claims with a clear access-denied screen.
4. Move demo tenant and sample data seeding out of unconditional client startup. It must only run against an isolated demo project or explicit safe demo mode.
5. Add Firestore Rules Emulator tests using `@firebase/rules-unit-testing` and the Firebase Emulator Suite.
6. Test at minimum:
   - unauthenticated read and write are denied;
   - tenant A cannot access tenant B;
   - missing, malformed, and stale tenant claims are denied;
   - a correctly provisioned user can perform only the operations permitted by the final role model;
   - unauthorized edits to wallet balances, fee payments, health records, attendance, and gate approvals are denied;
   - expected offline behavior and permission-denied handling are understood.
7. Implement role-based authorization before using real school data. Tenant membership alone should not mean every member can alter every record.
8. Verify the actual Firebase project and deployed rules. Repository rules are not proof of live deployment state.

## Rollout safety

- Do not deploy directly to production from this branch.
- Do not merge this rules-only change until the identity/claims migration and tests are ready; otherwise legitimate users without the custom claim will be locked out.
- Stage the rules and application changes together, run the emulator suite, verify a backup/restore path, and then deploy to the confirmed project with an approved operator.
- If real data may have been accessible while the permissive rules were deployed, preserve available logs and assess potential exposure before rotation or other changes.

## Scope

This change is an initial tenant-boundary control. It does **not** implement complete role-based access control, prove the rules are deployed, or certify the application as production-ready.
