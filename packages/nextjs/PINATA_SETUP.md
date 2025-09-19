# Pinata IPFS Setup Instructions

## 🔐 Environment Variables Setup

To use IPFS image uploads, you need to set up your Pinata API credentials as environment variables.

### Step 1: Create Environment File

Create a `.env.local` file in the `packages/nextjs` directory:

```bash
# In packages/nextjs/.env.local
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
PINATA_JWT=your_pinata_jwt_token_here
```

### Step 2: Get Your Pinata Credentials

1. Go to [Pinata Dashboard](https://app.pinata.cloud/)
2. Navigate to **API Keys** section
3. Create a new API key with these scopes:
   - ✅ `pinFileToIPFS` (Required for file uploads)
   - ✅ `pinJSONToIPFS` (Required for metadata)
   - ✅ `pinList` (Optional, for listing pins)

### Step 3: Update Your Environment File

Replace the placeholder values with your actual Pinata credentials:

```bash
# Example (replace with your actual keys)
NEXT_PUBLIC_PINATA_API_KEY=9f7c4b934e5f3aeaa630
PINATA_SECRET_KEY=1037bae3822f2df3b3334365e7463109aed2369ece7aaf4bd2dbd89151b74627
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Security Notes

- **Never commit** `.env.local` to version control
- The `NEXT_PUBLIC_` prefix makes the API key available to the frontend
- Secret keys and JWT tokens are server-side only
- Make sure `.env.local` is in your `.gitignore` file

### Step 5: Test the Setup

1. Start your development server: `yarn start`
2. Go to `/create-token` page
3. Try uploading an image
4. Check the browser's Network tab for Pinata API calls

## 🚀 Current Configuration

The app is currently configured with working Pinata credentials in `config/pinata.ts`. For production, you should:

1. Move these credentials to environment variables
2. Update the configuration to use `process.env` variables
3. Remove hardcoded credentials from the config file

## 📝 Troubleshooting

### "NO_SCOPES_FOUND" Error
- Make sure your Pinata API key has the required scopes
- Create a new API key with proper permissions

### Environment Variables Not Loading
- Restart your development server after adding environment variables
- Check that the `.env.local` file is in the correct location
- Verify the variable names match exactly

### Image Upload Failing
- Check browser Network tab for API call details
- Verify your Pinata credentials are correct
- Check Pinata dashboard for usage limits
