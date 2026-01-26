# Deployment Guide for Hostinger VPS

This guide explains how to deploy the **PX-AIssitent** application on a Hostinger VPS using Docker and Nginx Proxy Manager.

## Prerequisites

- A VPS running Ubuntu/Debian.
- **Docker** & **Docker Compose** installed.
- **Nginx Proxy Manager** (NPM) installed and running on port 81 (Admin) and 80/443 (HTTP/HTTPS).
- A domain name pointing to your VPS IP address.

---

## 1. Quick Setup (Automated)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/BibawanMuc/AgencyAssist.git
   cd AgencyAssist
   ```

2. **Configure Environment**
   Create a `.env` file in the project root:
   ```bash
   nano .env
   ```
   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   APP_PORT=3005   # Internal Docker port (use 3005 or any free port)
   ```

3. **Run Installation**
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
   This will build the Docker image and start the container named `px-aissitent-app`.

---

## 2. Nginx Proxy Manager Configuration

Since the app runs inside a Docker container, you need to expose it to the internet using Nginx Proxy Manager.

1. **Log in** to your Nginx Proxy Manager Admin Interface (usually `http://your-ip:81`).
2. Go to **Hosts** -> **Proxy Hosts**.
3. Click **Add Proxy Host**.
4. **Details Tab**:
   - **Domain Names**: `your-app.domain.com` (e.g., `app.px-agency.com`)
   - **Scheme**: `http`
   
   **Option A: Host IP Method (Most Reliable)**
   Use this if NPM runs in a different Docker network than your app (common scenario).
   - **Forward Hostname / IP**: `172.17.0.1` (Docker Host Gateway IP) OR your VPS Public IP.
   - **Forward Port**: `3005` (The APP_PORT you set in .env).

   **Option B: Container Name Method**
   Use this ONLY if NPM and App are in the SAME Docker network.
   - **Forward Hostname / IP**: `px-aissitent-app`
   - **Forward Port**: `80` (Internal container port).

   - **Block Common Exploits**: Enable.
   - **Websockets Support**: Enable.

5. **SSL Tab**:
   - **SSL Certificate**: Request a new Let's Encrypt certificate.
   - **Force SSL**: Enable.
   - **HTTP/2 Support**: Enable.
   - Click **Save**.

---

## 3. Maintenance

**Update Application:**
```bash
git pull origin main
./install.sh
```

**View Logs:**
```bash
docker logs -f px-aissitent-app
```

**Restart:**
```bash
docker restart px-aissitent-app
```

---

## Troubleshooting

### 502 Bad Gateway / OpenResty Error

This usually means Nginx Proxy Manager cannot reach your app container.

**Fix:**
1. Check if the container is running:
   ```bash
   docker ps
   ```
2. If it is running, the issue is likely networking. In Nginx Proxy Manager, change the **Forward Hostname / IP** to `172.17.0.1` and the **Forward Port** to `3005` (or whatever you set `APP_PORT` to).
