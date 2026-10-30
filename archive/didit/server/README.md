# Proxy Server for Web Platform

This proxy server handles CORS requests for the Didit API when running on the web platform.

## Why is this needed?

The Didit API does not support CORS (Cross-Origin Resource Sharing) for browser-based requests. Native mobile apps (iOS/Android) can call the API directly, but web browsers block these requests for security reasons.

## How it works

- **Native platforms (iOS/Android)**: Call the Didit API directly
- **Web platform**: Route requests through this local proxy server on `http://localhost:3001`

## Usage

### Starting the app with proxy support

For web development, you need to run both the Expo web server and the proxy server:

**Terminal 1 - Start the proxy server:**
```bash
npm run proxy
```

**Terminal 2 - Start the Expo web app:**
```bash
npm start
# Then press 'w' to open in web browser
```

### Native platforms

For iOS and Android, you don't need the proxy server. Just run:
```bash
npm run ios
# or
npm run android
```

## Configuration

The proxy server is configured to:
- Accept requests from `http://localhost:8081` and `http://localhost:19006`
- Forward requests to `https://api.didit.me`
- Pass through the `x-api-key` header for authentication

## Security Note

For production deployment, you should:
1. Deploy the proxy server to a secure environment (not localhost)
2. Add authentication to the proxy server itself
3. Restrict CORS origins to your actual domain
4. Use environment variables for configuration
