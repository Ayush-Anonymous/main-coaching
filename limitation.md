Here are all key limitations and boundaries for Node.js apps on Hostinger’s Business Web Hosting:

Node.js App Limit: Up to 5 Node.js web apps per account.
Resource Limits: 3 GB RAM, 50 GB SSD storage, 600,000 inodes (files/folders), and shared CPU resources.
No Root Access: You cannot install system-wide packages or modify server OS settings.
Environment Variables: Must be set through hPanel; .env files may not work as expected.
No Custom Daemons: Only web-facing apps (listening on HTTP/HTTPS) are supported; background daemons or persistent workers are not allowed.
Limited Module Support: Only npm packages that don’t require native system dependencies can be installed.
Process Management: The platform manages app restarts; custom process managers (like PM2) are not supported.
Network Restrictions: Outbound networking may be limited for security.
No SSH Root: SSH access is available, but not with root privileges.
For advanced needs (custom builds, background jobs, heavy processing), a VPS is recommended. Let me know if you want a detailed comparison or have specific requirements!

Business Web Hosting (Shared) Node.js
Managed environment—easy setup via hPanel, no server maintenance. No root access; limited to features and settings provided in hPanel. Up to 5 Node.js apps, strict resource limits (3 GB RAM, 50 GB storage). Only web-facing apps; background processes/daemons are not supported. Environment variables set via hPanel only. Can’t install custom system packages or use native modules needing OS dependencies.

VPS Node.js
Full root access—complete control over OS, software, and configuration. Install any Node.js version, modules, and system packages. Unlimited apps (within hardware limits) and custom process managers (e.g., PM2). Suitable for background jobs, daemons, and advanced networking. Manual setup and server management required (security, updates, backups).

Summary:
Business Web Hosting is best for simple, production-ready web apps with minimal server management. VPS is ideal for advanced, resource-intensive, or custom Node.js deployments needing full control.
For setup guides, see:

