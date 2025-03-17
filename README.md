# Open Prep: UPSC

A modern, minimal website for UPSC test series.

## Setup Instructions

1. **Create the Folder Structure**: Copy all files into `upsc-test-series/` as shown in the structure.
2. **Add Assets**: Place `india-logo.png` and `telegram.webp` in `public/assets/` and `admin/assets/`.
3. **Install Dependencies**: Open a terminal in `upsc-test-series/`, run `npm install`.
4. **Set Environment Variable**: Create a `.env` file with: MONGODB_URI=mongodb+srv://he7cules:uYxzpFLlXo4hOIGu@cluster0.wxfqq.mongodb.netmailto:uYxzpFLlXo4hOIGu@cluster0.wxfqq.mongodb.net)/upsc_test?retryWrites=true&w=majority&appName=Cluster0
5. **Deploy to Netlify**:
- Push to GitHub (exclude `.env`).
- Connect Netlify to your GitHub repo.
- Add `MONGODB_URI` in Netlify’s environment variables (Settings > Environment Variables).
- Enable Netlify Identity (Identity tab).
6. **Run Admin Locally**: 
- Install `live-server`: `npm install -g live-server`.
- In `admin/`, run `live-server`.
- Open `http://localhost:8080`.

## Notes

- The admin panel works locally for now. For full functionality, deploy it separately on Netlify.
- Everything is free: Netlify, MongoDB Atlas, GitHub.