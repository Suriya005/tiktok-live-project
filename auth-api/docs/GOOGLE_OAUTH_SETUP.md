# Google OAuth Setup Guide

## Prerequisites

1. Google Cloud Console account
2. A project in Google Cloud Console

## Step 1: Create OAuth 2.0 Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Select or Create a Project**
   - Click on the project dropdown at the top
   - Create a new project or select an existing one

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first

5. **Configure OAuth Consent Screen**
   - User Type: External (for testing) or Internal (for workspace users)
   - App name: Your app name (e.g., "TikTok Live Auth")
   - User support email: Your email
   - Developer contact email: Your email
   - Click "Save and Continue"
   - Scopes: Add `userinfo.email` and `userinfo.profile`
   - Test users: Add your email for testing
   - Click "Save and Continue"

6. **Create OAuth Client ID**
   - Application type: "Web application"
   - Name: "TikTok Live Auth API"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (your frontend)
     - `http://localhost:3001` (your API)
   - Authorized redirect URIs:
     - `http://localhost:3001/api/v1/auth/google/callback`
   - Click "Create"

7. **Copy Credentials**
   - Copy the "Client ID" and "Client secret"
   - Add them to your `.env` file

## Step 2: Update Environment Variables

Add the following to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## Step 3: Install Dependencies

```bash
npm install googleapis axios
```

## Usage

### Method 1: OAuth Flow (for Web Applications)

**Frontend Implementation:**

```javascript
// 1. Get Google Auth URL
const response = await fetch('http://localhost:3001/api/v1/auth/google');
const { data } = await response.json();

// 2. Redirect user to Google
window.location.href = data.authUrl;

// 3. Handle callback in your frontend
// User will be redirected to: http://localhost:3000/auth/callback?accessToken=xxx&refreshToken=xxx
// Parse tokens from URL and store them
```

**Backend automatically handles:**
- User authentication with Google
- Creating or updating user in database
- Generating JWT tokens
- Redirecting back to frontend with tokens

### Method 2: ID Token (for Mobile Apps / SPAs)

**Use Google Sign-In button in your app:**

```javascript
// After user signs in with Google, you'll get an ID token
const idToken = googleAuth.getAuthResponse().id_token;

// Send ID token to your backend
const response = await fetch('http://localhost:3001/api/v1/auth/google/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ idToken }),
});

const { data } = await response.json();
// Use data.accessToken and data.refreshToken
```

## Frontend Examples

### React with Google Sign-In Button

```jsx
import { GoogleLogin } from '@react-oauth/google';

function LoginPage() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/google/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      const { data } = await response.json();
      
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      
      // Redirect or update UI
      console.log('Logged in:', data.user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log('Login Failed')}
      />
    </div>
  );
}
```

### Vue.js with OAuth Flow

```vue
<template>
  <div>
    <button @click="loginWithGoogle">
      Login with Google
    </button>
  </div>
</template>

<script>
export default {
  methods: {
    async loginWithGoogle() {
      try {
        const response = await fetch('http://localhost:3001/api/v1/auth/google');
        const { data } = await response.json();
        
        // Redirect to Google
        window.location.href = data.authUrl;
      } catch (error) {
        console.error('Failed to get auth URL:', error);
      }
    },
  },
  
  mounted() {
    // Handle callback
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      // Clean URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
  },
};
</script>
```

## Testing with cURL

### Get Google Auth URL

```bash
curl http://localhost:3001/api/v1/auth/google
```

Response:
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

### Authenticate with ID Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/google/token \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_GOOGLE_ID_TOKEN"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@gmail.com",
      "name": "John Doe",
      "role": "user",
      "avatar": "https://..."
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

## Security Notes

1. **Never expose Client Secret in frontend code**
2. **Use HTTPS in production** - Update `COOKIE_SECURE=true`
3. **Configure proper CORS origins**
4. **Add your production domain** to Google Console authorized origins and redirect URIs
5. **Rotate secrets regularly**
6. **Monitor OAuth usage** in Google Cloud Console

## Production Deployment

1. **Update Google Console:**
   - Add production domain to authorized origins
   - Add production callback URL to redirect URIs
   - Example: `https://api.yourdomain.com/api/v1/auth/google/callback`

2. **Update .env for production:**
   ```env
   GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/v1/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   COOKIE_SECURE=true
   COOKIE_SAME_SITE=strict
   ```

3. **Verify OAuth consent screen:**
   - Submit for verification if needed
   - Add privacy policy and terms of service URLs

## Troubleshooting

### Error: redirect_uri_mismatch
- Check that redirect URI in Google Console exactly matches your callback URL
- Include protocol (http/https), port, and full path

### Error: invalid_client
- Verify Client ID and Client Secret are correct
- Check that credentials are for a Web application type

### Error: access_denied
- User declined authorization
- Check OAuth consent screen configuration

### Error: invalid_grant
- Authorization code already used
- Code expired (valid for 10 minutes)
- Request new authorization

## User Flow Diagram

```
User clicks "Login with Google"
       ↓
Frontend calls GET /api/v1/auth/google
       ↓
Backend returns Google Auth URL
       ↓
User redirected to Google login
       ↓
User authorizes application
       ↓
Google redirects to /api/v1/auth/google/callback?code=xxx
       ↓
Backend exchanges code for Google tokens
       ↓
Backend retrieves user info from Google
       ↓
Backend creates/updates user in database
       ↓
Backend generates JWT tokens
       ↓
Backend redirects to frontend with tokens
       ↓
Frontend stores tokens and user is logged in
```

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
