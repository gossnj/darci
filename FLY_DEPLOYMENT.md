# DARCI Fly.io Deployment Guide

This guide will help you deploy DARCI to Fly.io, a containerized hosting platform that supports SQLite and Docker.

## Prerequisites

1. **Fly.io CLI**: Install from [fly.io/docs/hands-on/install-flyctl/](https://fly.io/docs/hands-on/install-flyctl/)
2. **Fly.io Account**: Sign up at [fly.io](https://fly.io)
3. **Bungie API Credentials**: Get from [Bungie Developer Portal](https://www.bungie.net/en/Application)

## Quick Start

### 1. Install Fly.io CLI

```bash
# macOS
brew install flyctl

# Or download from https://fly.io/docs/hands-on/install-flyctl/
```

### 2. Login to Fly.io

```bash
fly auth login
```

### 3. Deploy DARCI

```bash
# From the project root directory
fly launch

# Follow the prompts:
# - App name: darci (or your preferred name)
# - Region: Choose closest to your users
# - Don't deploy now (we'll set up environment variables first)
```

### 4. Set Environment Variables

```bash
# Set your Bungie API credentials
fly secrets set BUNGIE_API_KEY=your_api_key_here
fly secrets set BUNGIE_CLIENT_ID=your_client_id_here
fly secrets set BUNGIE_CLIENT_SECRET=your_client_secret_here

# Set the Destiny 2 username to sync data for
fly secrets set USER=your_destiny_username

# Optional: Set NODE_ENV
fly secrets set NODE_ENV=production
```

### 5. Deploy the Application

```bash
fly deploy
```

### 6. Open Your App

```bash
fly open
```

## Configuration Details

### Fly.io Configuration (`fly.toml`)

The `fly.toml` file contains:
- **App name**: `darci`
- **Region**: `ord` (Chicago) - change to your preferred region
- **Memory**: 256MB (suitable for small apps)
- **CPU**: 1 shared CPU
- **Port**: 8080 (internal)
- **Persistent storage**: `/data` directory for SQLite databases

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BUNGIE_API_KEY` | Your Bungie API key | Yes |
| `BUNGIE_CLIENT_ID` | Your Bungie OAuth client ID | Yes |
| `BUNGIE_CLIENT_SECRET` | Your Bungie OAuth client secret | Yes |
| `USER` | Destiny 2 username to sync data for | Yes |
| `NODE_ENV` | Node environment (production) | No |

### Database Storage

- **SQLite databases** are stored in `/data` directory
- **Persistent volume** ensures data survives app restarts
- **Automatic backups** via Fly.io's volume system

## Managing Your Deployment

### View Logs

```bash
fly logs
```

### SSH into Container

```bash
fly ssh console
```

### Scale Your App

```bash
# Scale to 2 instances
fly scale count 2

# Scale memory
fly scale memory 512
```

### Update Environment Variables

```bash
fly secrets set BUNGIE_API_KEY=new_api_key
```

### Redeploy

```bash
fly deploy
```

## Troubleshooting

### Common Issues

1. **App won't start**: Check logs with `fly logs`
2. **Database errors**: Ensure persistent volume is mounted
3. **API errors**: Verify Bungie API credentials are correct
4. **User sync fails**: Check USER environment variable is set

### Debug Commands

```bash
# View detailed logs
fly logs --verbose

# Check app status
fly status

# View app info
fly info

# Check secrets
fly secrets list
```

### Reset Everything

```bash
# Destroy the app
fly apps destroy darci

# Start fresh
fly launch
```

## Cost Optimization

### Free Tier Usage

- **3 small apps** (256MB each)
- **160GB-hours** of usage per month
- **Perfect for testing** and small deployments

### Paid Plans

- **Starter**: $1.94/month for 256MB RAM
- **Standard**: $3.88/month for 512MB RAM
- **Performance**: $7.76/month for 1GB RAM

### Tips to Reduce Costs

1. **Use auto-stop**: Apps stop when not in use (configured in `fly.toml`)
2. **Monitor usage**: `fly dashboard` shows resource usage
3. **Optimize memory**: Start with 256MB, scale up if needed

## Security Considerations

1. **API Keys**: Stored as Fly.io secrets (encrypted)
2. **HTTPS**: Automatically enabled
3. **Database**: SQLite files are not exposed externally
4. **Updates**: Regular security updates via Docker base images

## Monitoring and Maintenance

### Health Checks

The app automatically responds to health checks on port 8080.

### Updates

To update DARCI:

1. Pull latest changes: `git pull`
2. Redeploy: `fly deploy`
3. Monitor: `fly logs`

### Backups

- **Automatic**: Fly.io handles volume backups
- **Manual**: Download database files via `fly ssh console`

## Support

- **Fly.io Docs**: [fly.io/docs](https://fly.io/docs)
- **DARCI Issues**: [GitHub Issues](https://github.com/mikechambers/darci/issues)
- **Community**: [Fly.io Community](https://community.fly.io)

## Next Steps

After successful deployment:

1. **Test the app**: Verify all features work
2. **Set up monitoring**: Use Fly.io dashboard
3. **Configure backups**: Set up regular database backups
4. **Scale as needed**: Monitor usage and scale resources

Your DARCI instance should now be running on Fly.io! 🚀
