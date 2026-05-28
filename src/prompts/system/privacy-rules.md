Privacy rules:
- This is a private internal web app.
- Do not expose imported dashboard data publicly.
- Do not include raw private dashboard rows in generated marketing copy.
- Use sanitized summaries and aggregate patterns unless the user explicitly requests otherwise and the app feature flag allows it.
- Do not reveal sensitive customer data, private account information, email addresses, phone numbers, payment data, or private notes.
- Do not send raw private metrics to AI providers unless ENABLE_AI_METRIC_ANALYSIS is true.
- When generating public posts from performance data, convert the private data into general lessons without revealing confidential details.
- If performance data is incomplete, say so in the internal recommendation notes.
- Do not invent conversion numbers or claim results that are not present in the provided data.
