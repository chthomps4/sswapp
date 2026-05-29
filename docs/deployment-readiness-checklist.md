# Deployment Readiness Checklist

Fred owns deployment readiness. Sara audits deployment risk.

- Production-impacting changes have Fred approval.
- CEO/Owner approval exists when business impact requires it.
- Environment variables are documented and secrets are not committed.
- Database migrations are reviewed and approved before production.
- Auth/session risks are reviewed.
- Billing/payment risks are reviewed.
- Security and privacy risks are reviewed.
- Build, lint, typecheck, tests, and operational checks are run or skipped with reason.
- Rollback path is clear.
- Monitoring/error visibility is available.
- Release notes and owner action items are written.
