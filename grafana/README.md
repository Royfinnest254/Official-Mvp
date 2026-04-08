# Connex Institutional Monitoring (Grafana)

This directory contains the necessary configuration to launch a high-fidelity monitoring dashboard for the Connex Institutional Ledger.

## 1. Prerequisites
- **Grafana Instance**: You can use [Grafana Cloud](https://grafana.com/products/cloud/) (Free tier available) or a local Docker instance.
- **Prometheus Scraper**: You will need a Prometheus instance (or Grafana Agent) configured to scrape `http://<your-gateway-url>/metrics`.

## 2. Set Up Data Sources

### A. PostgreSQL (Historical Ledger)
1. Log in to your Grafana instance.
2. Go to **Configuration (Gear Icon) > Data Sources**.
3. Click **Add data source** and select **PostgreSQL**.
4. Configure the settings:
   - **Host**: `db.<project-id>.supabase.co:5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: Your Supabase Database Password.
   - **TLS/SSL Mode**: `require`.
5. Click **Save & Test**.

### B. Prometheus (Real-time Operations)
1. In **Data Sources**, click **Add data source** and select **Prometheus**.
2. Configure the settings:
   - **URL**: `http://<your-gateway-url>/metrics` (or wherever your Prometheus is scraping from).
3. Click **Save & Test**.

## 3. Import Dashboard
1. Go to **Dashboards (Four Squares Icon) > + Import**.
2. Click **Upload JSON file**.
3. Select `dashboard-v1.json` from this directory.
4. Select the **PostgreSQL** data source you just created.
5. Click **Import**.

## 4. Key Metrics Tracked
- **TPS (Transactions Per Second)**: Real-time network throughput.
- **Settlement Latency**: Average time taken for 2-of-3 quorum reaching.
- **Institutional Matrix**: Volume distribution between participating banks.
- **Audit Health**: Total transaction count and signature participation.

---
**Maintained by Antigravity AI | Connex PRD v1.0**
