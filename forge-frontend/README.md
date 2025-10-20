# Frontend Deployment Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Frontend**
   ```bash
   npm run build
   ```
   > Static assets will be output to `dist/` directory.

3. **Deploy to Atlassian Forge**
   ```bash
   forge deploy
   ```
   > Deploy frontend static assets to Forge cloud.

4. **Install to Confluence Instance**
   ```bash
   forge install
   ```
   > First-time installation to your Confluence space.

5. **Upgrade Installed App**
   ```bash
   forge install --upgrade
   ```
   > Use when you have a new version to overwrite installation.
