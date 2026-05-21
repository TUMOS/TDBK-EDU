# Security Specification & Threat Model

This security spec adheres strictly to the Zero-Trust Architecture guidelines for attribute-based access control (ABAC) in the Boarding School Admin Ecosystem.

## 1. Core Data Invariants

1. **Hierarchy Integrity**: Every attendance record, gate log, cbc evaluation, health summary, and financial ledger entry is valid only if linked to an existing authenticated student sequence ID (`id` matches `TDBK-[0-9]+`).
2. **Transactional Soundness**: Digital Canteen transactions or fee allocations cannot be requested anonymously. The pocketMoneyBalance field can only register decimals <= 100,000 KES.
3. **Privilege Isolation**: Only validated Principal/Teacher entities can modify Permission bounds or grade logs. Students can only request passes (`Pending`) or health logs; they can never change `status` to `Approved` or overwrite CBC scores.
4. **Email Security Invariant**: Administrative capabilities are granted strictly to verified staff matching verified email addresses (`email_verified == true`).

---

## 2. The "Dirty Dozen" Payloads

Here are the 12 malicious payloads designed to stress-test our rules, verifying that identity hijacking or privilege escalations return `PERMISSION_DENIED`.

### Vector 1: Wallet Balance Self-Escalation
*   **Target Path**: `/students/TDBK-101`
*   **Vulnerability Idea**: Directly overwrite pocketMoneyBalance to add unlimited canteen funds.
*   **Payload**:
    ```json
    { "pocketMoneyBalance": 9999999 }
    ```

### Vector 2: Self-Approve Gate Exit Pass
*   **Target Path**: `/permissions/PASS-701`
*   **Vulnerability Idea**: Overwrite an active pending pass to standard "Approved" bypass gate control.
*   **Payload**:
    ```json
    { "status": "Approved", "approvedBy": "Self" }
    ```

### Vector 3: Massive String Poisoning (Denial of Wallet)
*   **Target Path**: `/gateLogs/GL-301`
*   **Vulnerability Idea**: Overflow text properties to exhaust project database read capacities.
*   **Payload**:
    ```json
    { "clearedBy": "OVERFLOW_1MB_STRING_..." }
    ```

### Vector 4: Foreign Student Grade Tampering
*   **Target Path**: `/cbcAssessments/CBC-101`
*   **Vulnerability Idea**: Insert fabricated academic reports under a target's registration.
*   **Payload**:
    ```json
    { "score": "EE", "comments": "Cheated assessment to exceed exceptions" }
    ```

### Vector 5: Spoof Principal Identity
*   **Target Path**: `/chatMessages/chat-999`
*   **Vulnerability Idea**: Broadcast global announcements claiming to be "Principal Wekesa" without validation.
*   **Payload**:
    ```json
    { "sender": "Principal", "senderName": "Principal Wekesa", "recipientId": "General-School", "content": "School is closed early, go home." }
    ```

### Vector 6: Fee Clearing Hijack
*   **Target Path**: `/feePayments/FEE-888`
*   **Vulnerability Idea**: Inject a fake payment clearance to pretend outstanding fees are zeroed.
*   **Payload**:
    ```json
    { "amount": 45000, "method": "M-Pesa", "reference": "FAKE_REF_ID" }
    ```

### Vector 7: Invalid ID Key Poisoning
*   **Target Path**: `/students/INVALID%20ID%20KEY%20%23!!`
*   **Vulnerability Idea**: Write characters outside of standard alphanumeric constraints into document IDs.
*   **Payload**:
    ```json
    { "name": "Poison ID Student", "grade": "Grade 7" }
    ```

### Vector 8: Overwriting Historical Attendance Checkins
*   **Target Path**: `/attendance/att-101`
*   **Vulnerability Idea**: Change a student's past presence classification retrospectively.
*   **Payload**:
    ```json
    { "status": "Present", "markedBy": "Malicious Student" }
    ```

### Vector 9: Clinic Intake Overwrite
*   **Target Path**: `/healthRecords/HLTH-201`
*   **Vulnerability Idea**: Force sick status discharge without Matron signature.
*   **Payload**:
    ```json
    { "status": "Discharged To Class" }
    ```

### Vector 10: Anonymous Checkout Triggering
*   **Target Path**: `/gateLogs/GL-999`
*   **Vulnerability Idea**: Post checkouts without valid active gate permissions.
*   **Payload**:
    ```json
    { "action": "Check-Out", "clearedBy": "Empty Session User" }
    ```

### Vector 11: Immutable Timestamp Erasure
*   **Target Path**: `/transactions/TX-555`
*   **Vulnerability Idea**: Replace historical time tags with client timestamps.
*   **Payload**:
    ```json
    { "timestamp": "2020-01-01T00:00:00Z" }
    ```

### Vector 12: Anonymous Message Broadcasting
*   **Target Path**: `/chatMessages/chat-123`
*   **Vulnerability Idea**: Write unauthenticated direct notifications to foreign recipient boxes.
*   **Payload**:
    ```json
    { "recipientId": "TDBK-102", "content": "Staged threat message" }
    ```

---

## 3. Test Runner Design

Below is the verified suite test runner mock representation:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Zero-Trust Fortress Rules Unit Testing', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gen-lang-client-0114872515',
      firestore: { rules: true }
    });
  });

  it('blocks Vector 1: Wallet Overwrite by Unprivileged Accounts', async () => {
    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthenticatedDb.doc('students/TDBK-101').set({ pocketMoneyBalance: 9999999 }));
  });

  it('blocks Vector 2: User trying to approve their own Gate Pass', async () => {
    const context = testEnv.authenticatedContext('student-uid');
    await assertFails(context.firestore().doc('permissions/PASS-701').update({ status: 'Approved' }));
  });

  it('rejects Vector 7: Junk Character Key Injection into Document Paths', async () => {
    const context = testEnv.authenticatedContext('sentry-1');
    await assertFails(context.firestore().doc('students/INVALID%20PATH%22').set({ name: 'Poison' }));
  });
});
```
