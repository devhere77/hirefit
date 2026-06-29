# n8n workflows for the Job Portal

Two workflows, both triggered by **one shared webhook**. The webhook URL goes
into `.env` as `VITE_N8N_WEBHOOK_URL` (used by the React app) and exported as
`N8N_WEBHOOK_URL` before running `bun run fetch-jobs`.
The app POSTs JSON with a `type` field; n8n's **Switch** node routes it:
| `type` | Trigger | Action |
| ----------------- | ------------------------------------------------ | ------------------------------------------- |
| `register` | User signs up in the app | Append `{email}` to a Google Sheet of users |
| `new-jobs` | You run `bun run fetch-jobs` | Loop the Sheet → email every user the list |
| `apply` | User clicks **Apply** on a job | Email the user a confirmation |
| `tailored-resume` | User clicks **Tailor my resume with AI** | Email/WhatsApp the resume back to the user |

## Setup (5 minutes)

1. In n8n: **Import from File** → `job-portal-workflow.json`.
2. Open the **Webhook** node → copy the Production URL.
3. Paste it into your project's `.env`:
   ```
   VITE_N8N_WEBHOOK_URL=https://your-n8n.example.com/webhook/job-portal
   ```
4. Connect your **Gmail** (or SMTP) credential on every email node.
5. Connect a **Google Sheet** credential — create a sheet with one column `email`.
6. (Optional) Connect **Twilio** for the WhatsApp branch on `tailored-resume`.
7. Activate the workflow.

## Run it

```bash
export N8N_WEBHOOK_URL="https://your-n8n.example.com/webhook/job-portal"
bun run fetch-jobs           # → fires `new-jobs` to every registered user
```

Inside the app, sign-up, apply, and tailor actions fire automatically.
