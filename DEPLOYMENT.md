# Deployment Guide for Hostinger VPS

This guide explains how to deploy the **PX-AIssistent** application on a Hostinger VPS using Docker and Nginx Proxy Manager.

## Prerequisites

- A VPS running Ubuntu/Debian.
- **Docker** & **Docker Compose** installed.
- **Nginx Proxy Manager** (NPM) installed and running.
- **Existing Docker Network**: `proxy-netz` (created by NPM or manually).
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
   APP_PORT=3005   # Optional: Only needed if you want direct access via IP:PORT
   ```

3. **Run Installation**
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
   This will build the Docker image and start the container `px-aissistent-app` connected to the `proxy-netz` network.

---

## 2. Nginx Proxy Manager Configuration

The app is now part of the `proxy-netz` Docker network. You can connect to it using its container name.

1. **Log in** to your Nginx Proxy Manager Admin Interface.
2. Go to **Hosts** -> **Proxy Hosts**.
3. Click **Add Proxy Host**.
4. **Details Tab**:
   - **Domain Names**: `your-app.domain.com` (e.g., `app.px-agency.com`)
   - **Scheme**: `http`
   - **Forward Hostname / IP**: `px-aissistent-app`
   - **Forward Port**: `80`
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
git stash
git pull origin main
chmod +x install.sh
./install.sh
```

**Restart:**
```bash
docker restart px-aissistent-app
```

---

## Architecture Internal

- **Container**: `px-aissistent-app`
- **Network**: `proxy-netz` (External)
- **Internal Port**: 80 (Served by Nginx inside container)
- **Proxy**: NPM connects directly to container on Port 80
