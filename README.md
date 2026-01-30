<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PX-AIssistent

Professional AI Content Creation Suite powered by Google Gemini & Veo.

## Features

- **Multi-Modal Chat**: Specialized bots for Dev, Content, and Analysis.
- **Image Generation**: Flux/Gemini powered image generation with inpainting.
- **Video Generation**: Text-to-Video and Image-to-Video using Veo 3.1.
- **Storyboarding**: Complete cinematic workflow tools.
- **Webcam Integration**: Direct capture for Image, Video, and Storyboard assets.
- **History & Persistence**: Full history tracking via Supabase for all generated content.
- **Secure Cloud**: User authentication and RLS-protected storage.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: Google Gemini API, Google Veo API

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env.local` file with the following credentials:
   ```env
   # Google AI
   API_KEY=your_gemini_api_key

   # Supabase
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**
   Run the SQL commands found in `supabase_schema.sql` in your Supabase SQL Editor to set up the required tables and security policies.

4. **Run Locally**
   ```bash
   npm run dev
   ```

5. **Deployment**
   See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed VPS deployment instructions.

## Architecture

This application uses a serverless architecture where the React frontend communicates directly with Supabase for data persistence and authentication, and with Google's AI APIs for content generation.
