# Deployment Guide: Xahay (সহায়)

This guide documents deploying Xahay to production using **Vercel** for application hosting and **MongoDB Atlas** for database persistence.

> [!NOTE]
> **Zero Database Dependency**: Xahay is engineered with an in-memory repository and bundled seed data. If `MONGODB_URI` is omitted, the application boots instantly in standalone mode with full functionality, using static emergency data and in-memory report queues.

---

## 1. MongoDB Atlas Setup (Free Tier M0)

MongoDB Atlas provides a persistent document database for emergency alerts, community reports, and relief shelter directories.

### Step 1.1: Create a Free Tier Cluster

1. Log in or create an account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Create Deployment** and select the **M0 Free Tier** (Shared cluster).
3. Select an AWS or Google Cloud region closest to North East India (e.g., `ap-south-1` Mumbai) for minimum network latency.
4. Name your cluster (e.g., `xahay-cluster`) and click **Create**.

### Step 1.2: Configure Database User Authentication

1. Navigate to **Security** > **Database Access**.
2. Click **Add New Database User**.
3. Select **Password Authentication**.
4. Enter a secure username (e.g. `xahay_app`) and generate a strong password.
5. Under **Database User Privileges**, assign `Read and write to any database` (or scope strictly to database `xahay`).
6. Click **Add User**. Save the username and password securely.

### Step 1.3: Configure Network Access

1. Navigate to **Security** > **Network Access**.
2. Click **Add IP Address**.
3. Choose **Allow Access from Anywhere** (`0.0.0.0/0`).
   > _Why?_ Vercel's serverless edge and server execution environments rotate dynamic IP pools. Allowing `0.0.0.0/0` ensures serverless Lambdas maintain connectivity to your database. Access remains securely protected by database user credentials and TLS encryption.
4. Click **Confirm**.

### Step 1.4: Obtain Connection String

1. Go to **Deployments** > **Database** and click **Connect**.
2. Select **Drivers** (Node.js).
3. Copy the SRV connection URI:
   ```text
   mongodb+srv://<username>:<password>@xahay-cluster.xxxx.mongodb.net/xahay?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your database user credentials. Specify database name `/xahay`.

---

## 2. Vercel Deployment Setup

### Step 2.1: Import Project

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New** > **Project**.
3. Connect your GitHub repository (`xahay`).
4. Select the project repository and click **Import**.

### Step 2.2: Build & Output Settings

Vercel automatically detects Next.js:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: Next.js default (`.next`)
- **Install Command**: `npm install`

---

## 3. Environment Variables Reference

Configure the following environment variables in the Vercel Project Settings (**Settings** > **Environment Variables**).

> [!CAUTION]
> **Zero Secrets in Code**: Never commit secret values or private keys to source control. None of the secret variables below must ever be prefixed with `NEXT_PUBLIC_`.

| Variable Name         |  Required  | Default / Example Format                            | Purpose & Description                                                                                                                                      |
| :-------------------- | :--------: | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RATE_LIMIT_SALT`     |  **Yes**   | `a-64-character-random-hex-string`                  | Secret salt used by `src/lib/rateLimit.ts` to compute one-way SHA-256 hashes of client signatures. Ensures client IP privacy while enforcing abuse limits. |
| `MONGODB_URI`         |     No     | `mongodb+srv://user:pass@cluster.mongodb.net/xahay` | Connection string for MongoDB Atlas. If omitted, the app runs gracefully using bundled seed data and in-memory storage.                                    |
| `SESSION_SECRET`      | Admin Only | `a-strong-32-byte-random-session-key`               | Cryptographic secret used to sign and verify administrative session cookies (`xahay_admin_session`).                                                       |
| `ADMIN_PASSCODE_HASH` | Admin Only | `$2b$12$...` or sha256 hex string                   | Salted cryptographic hash of the administrative login passcode for moderation and alert creation.                                                          |
| `NODE_ENV`            | Automatic  | `production`                                        | Set automatically by Vercel in production environments. Enables production Service Worker registration.                                                    |
| `NEXT_PUBLIC_APP_URL` |     No     | `https://xahay.vercel.app`                          | Base canonical URL used for Open Graph metadata and share links.                                                                                           |

### Generating Secure Keys

You can generate high-entropy random secrets locally via your terminal:

```bash
# Generate RATE_LIMIT_SALT
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Serverless Rate Limiter Limitation & Production Scaling

### Architecture Note: In-Memory Rate Limiting

In the default configuration, Xahay includes an internal in-memory sliding window rate limiter (`src/lib/rateLimit.ts`).

- **Limitation in Serverless**: In a serverless cloud environment (such as Vercel Lambdas), each container instance maintains its own memory space. Cold starts or scaling across multiple concurrent execution instances reset the in-memory window counters.
- **Production Recommendation**:
  For large-scale public deployments with heavy concurrent traffic, plug in a distributed cache (such as **Upstash Redis** or **Redis Cloud**) by implementing the swappable `RateLimiter` interface in `src/lib/rateLimit.ts`.

---

## 5. Post-Deployment Verification Checklist

Once deployed to Vercel, complete these validation steps:

1. **Health Endpoint**:
   Visit `https://<your-vercel-domain>/api/health` and verify HTTP 200 with status `"healthy"`.
2. **PWA Service Worker**:
   Open Chrome DevTools > Application > Service Workers. Verify that `public/sw.js` is registered, active, and controlling the page.
3. **Emergency Helplines Offline**:
   Enable Airplane Mode on a physical smartphone or DevTools network throttling to "Offline". Reload the site. Verify that 112 emergency calling buttons and flood/landslide guides load instantly.
4. **Offline Incident Report Queue**:
   Submit a test report while offline. Verify the confirmation indicates it was queued locally. Re-enable network connectivity and observe automatic submission to the moderation pipeline.
5. **Mobile Viewport Test**:
   Test on a physical device at 320px viewport and confirm touch targets exceed 48x48 px.
