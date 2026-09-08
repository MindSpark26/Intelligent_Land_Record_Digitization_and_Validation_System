# context/

React Context providers for global, cross-page state (e.g. auth session,
theme, toast notifications).

Currently empty: the app has no state shared across routes yet — the dashboard's
document list is loaded locally via the [`useDocuments`](../hooks/useDocuments.js)
hook. Add providers here when shared state appears, and wrap the app in
`src/app/layout.js`.
