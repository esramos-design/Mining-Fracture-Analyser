# Security Policy

## Reporting a vulnerability

Please do not open a public GitHub issue for a suspected security vulnerability.

Instead, contact the maintainer privately through the contact method available on the maintainer's GitHub profile and include enough information to reproduce and assess the issue.

A useful report should include:

- the affected component or feature;
- the MFA version or commit if known;
- steps to reproduce;
- the security impact you believe is possible;
- any proof-of-concept material needed to demonstrate the issue.

Please avoid accessing, modifying, or retaining data that does not belong to you while investigating a vulnerability.

## Sensitive information

Never include the following in issues, pull requests, screenshots, logs, or test fixtures:

- API keys;
- access tokens;
- passwords;
- session credentials;
- private account identifiers;
- personal information not required for the report.

If a secret is accidentally exposed, revoke or rotate it immediately with the relevant provider.

## Third-party services

MFA may integrate with third-party services for optional functionality. Vulnerabilities in those services should generally be reported to the relevant provider unless the issue is caused by MFA's own integration code.

## Supported versions

Security fixes are generally targeted at the current maintained release and current development version. Older releases may not receive backported fixes.

## Disclosure

Please allow reasonable time for investigation and remediation before publicly disclosing an unresolved vulnerability.
