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
   APP_PORT=3000   # Internal Docker port (default)
   ```

3. **Run Installation**
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
   This will build the Docker image and start the container named `px-aissitent-app`.

---

## 2. Nginx Proxy Manager Configuration

Since the app runs inside a Docker container on port `3000` (by default), you need to expose it to the internet using Nginx Proxy Manager.

1. **Log in** to your Nginx Proxy Manager Admin Interface (usually `http://your-ip:81`).
2. Go to **Hosts** -> **Proxy Hosts**.
3. Click **Add Proxy Host**.
4. **Details Tab**:
   - **Domain Names**: `your-app.domain.com` (e.g., `app.px-agency.com`)
   - **Scheme**: `http`
   - **Forward Hostname / IP**: `px-aissitent-app` (This is the container name defined in `docker-compose.prod.yml`. Docker DNS resolves this automatically if they are in the same network, otherwise use your VPS internal IP like `172.17.0.1` or the specific docker network IP).
   - **Forward Port**: `80` (The internal port *inside* the container is 80, served by Nginx).
   - **Block Common Exploits**: Enable.

   > **Note on Networking:** If NPM is in a separate Docker network, you might need to add `px-aissitent-app` to that network or use the Host IP address and the exposed port `3000`.
   >
   > **Recommended (Host IP Method):**
   > - **Forward Hostname / IP**: `host.docker.internal` (if enabled) OR your VPS Public IP.
   > - **Forward Port**: `3000` (The port mapped in `docker-compose.prod.yml`).

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

## Architecture Internal

- **Container**: `px-aissitent-app`
- **Internal Server**: Nginx (serving built static files) -> Port 80 (Internal)
- **Exposed Port**: 3000 (External -> mapped to Internal 80)
- **Env**: Variables are baked into the build or injected at runtime.
