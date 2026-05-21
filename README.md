# Corezality — Stackd Project

## Folder structure

  stackd-site\        Your marketing website. Deploys to Netlify.
  client-system\      Your delivery IP. Base template, schema, prompts.
  clients\            One subfolder per client. Copy _template to start.
  ops\                Proposals, invoices, contracts.

## Starting a new client

  1. Copy clients\_template to clients\client-name\
  2. Fill in client.config.json from questionnaire responses
  3. Copy base-template into the client folder and theme it
  4. Deploy to Netlify on a preview URL
  5. Collect balance, point domain, launch

## Key files

  client-system\claude-system-prompt.md    Paste into Claude Projects
  client-system\content-kit-template.md    Send to client on deposit
  client-system\client.config.schema.json  Config reference schema
