# Web Platform Setup for Didit API

The Didit API has been configured to work on all platforms (iOS, Android, and Web).

## How It Works

- **Native platforms (iOS/Android)**: Call the Didit API directly at `https://api.didit.me`
- **Web platform**: Route requests through a local proxy server at `http://localhost:3001` to handle CORS

## Running the App

### For Web Development (Recommended)

You need to run both the proxy server and the Expo web server:

**Terminal 1 - Start the proxy server:**
```bash
npm run web:proxy
```

**Terminal 2 - Start the Expo web app:**
```bash
npm start
# Then press 'w' to open in web browser
```

The app will be available at `http://localhost:8081`

### For Native Platforms

No proxy server needed. Just run:

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## What Changed

1. **Added proxy server** (`server/proxy.js`):
   - Handles CORS for web requests
   - Forwards requests to Didit API
   - Runs on port 3001

2. **Updated DiditService** (`src/services/DiditService.ts`):
   - Detects platform using `Platform.OS`
   - Uses proxy URL for web, direct URL for native

3. **Added npm scripts**:
   - `npm run proxy` - Start proxy server only
   - `npm run web:proxy` - Start proxy server with instructions

## Testing

To test the web implementation:
1. Start the proxy server: `npm run web:proxy`
2. In another terminal, start Expo: `npm start`
3. Press 'w' to open in web browser
4. Navigate to the verification page and test the API calls

## Troubleshooting

**"Failed to fetch" error on web:**
- Make sure the proxy server is running (`npm run web:proxy`)
- Check that the proxy is on port 3001
- Verify both terminals are running

**CORS errors:**
- Ensure the proxy server is started before the web app
- Check that the proxy accepts requests from `http://localhost:8081`

## Production Deployment

For production web deployment, you will need to:
1. Deploy the proxy server to a cloud service (e.g., Vercel, AWS, Heroku)
2. Update the `PROXY_BASE_URL` in `DiditService.ts` to your production proxy URL
3. Add authentication to the proxy server
4. Configure CORS origins to your production domain
