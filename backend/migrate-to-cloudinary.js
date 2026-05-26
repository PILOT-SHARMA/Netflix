/**
 * Migration Script: Re-upload local files to Cloudinary and update MongoDB URLs
 * 
 * This script:
 * 1. Connects to your MongoDB
 * 2. Finds all Series and Episodes with localhost URLs
 * 3. Reads the corresponding local files from the uploads/ directory
 * 4. Uploads them to Cloudinary
 * 5. Updates the MongoDB documents with Cloudinary URLs
 * 
 * Run: node migrate-to-cloudinary.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cloudinary = require('./config/cloudinary');
const Series = require('./models/Series');
const Episode = require('./models/Episode');
const Media = require('./models/Media');

const uploadToCloudinary = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

// Extract the filename from a localhost URL
const getLocalFilePath = (url) => {
  if (!url) return null;
  // Handle URLs like http://localhost:5001/uploads/images/filename.JPG
  // or https://netflix-xovf.onrender.com/uploads/images/filename.JPG
  const match = url.match(/\/uploads\/(images|videos|thumbnails)\/(.+)$/);
  if (match) {
    const folder = match[1];
    const filename = match[2];
    return path.join(__dirname, 'uploads', folder, filename);
  }
  return null;
};

const isLocalUrl = (url) => {
  if (!url) return false;
  return url.includes('localhost') || url.includes('127.0.0.1');
};

const migrateUrl = async (url, resourceType = 'image') => {
  if (!url || !isLocalUrl(url)) {
    console.log(`  Skipping (not a localhost URL): ${url}`);
    return url;
  }

  const localPath = getLocalFilePath(url);
  if (!localPath || !fs.existsSync(localPath)) {
    console.log(`  ⚠️  Local file not found: ${localPath}`);
    return url; // Keep original if file not found
  }

  try {
    console.log(`  Uploading ${localPath} to Cloudinary as ${resourceType}...`);
    const result = await uploadToCloudinary(localPath, {
      folder: `netflix/${resourceType}s`,
      resource_type: resourceType,
    });
    console.log(`  ✅ Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    console.error(`  ❌ Error uploading ${localPath}:`, err.message);
    return url; // Keep original on error
  }
};

const migrate = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Migrate Series
    console.log('📺 Migrating Series...');
    const allSeries = await Series.find();
    for (const s of allSeries) {
      console.log(`\nSeries: "${s.title}" (${s._id})`);
      let changed = false;

      if (isLocalUrl(s.bannerImage)) {
        s.bannerImage = await migrateUrl(s.bannerImage, 'image');
        changed = true;
      }
      if (isLocalUrl(s.thumbnail)) {
        s.thumbnail = await migrateUrl(s.thumbnail, 'image');
        changed = true;
      }

      if (changed) {
        await s.save();
        console.log(`  💾 Series "${s.title}" updated in DB`);
      }
    }

    // Migrate Episodes
    console.log('\n\n🎬 Migrating Episodes...');
    const allEpisodes = await Episode.find();
    for (const ep of allEpisodes) {
      console.log(`\nEpisode: "${ep.title}" (${ep._id})`);
      let changed = false;

      if (isLocalUrl(ep.videoUrl)) {
        ep.videoUrl = await migrateUrl(ep.videoUrl, 'video');
        changed = true;
      }
      if (isLocalUrl(ep.thumbnail)) {
        ep.thumbnail = await migrateUrl(ep.thumbnail, 'image');
        changed = true;
      }

      if (changed) {
        await ep.save();
        console.log(`  💾 Episode "${ep.title}" updated in DB`);
      }
    }

    // Migrate Media (if any)
    console.log('\n\n🖼️ Migrating Media...');
    const allMedia = await Media.find();
    for (const m of allMedia) {
      console.log(`\nMedia: "${m.title}" (${m._id})`);
      let changed = false;

      if (isLocalUrl(m.url)) {
        const resourceType = m.type === 'video' ? 'video' : 'image';
        m.url = await migrateUrl(m.url, resourceType);
        changed = true;
      }
      if (isLocalUrl(m.thumbnail)) {
        m.thumbnail = await migrateUrl(m.thumbnail, 'image');
        changed = true;
      }

      if (changed) {
        await m.save();
        console.log(`  💾 Media "${m.title}" updated in DB`);
      }
    }

    console.log('\n\n🎉 Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
};

migrate();
