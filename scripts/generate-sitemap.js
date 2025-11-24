import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  console.log('🗺️ Generating sitemap.xml...\n');

  try {
    // Get all active properties
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, kode_listing, status, jenis_properti, provinsi, kabupaten, judul_properti, created_at, updated_at')
      .neq('status', 'sold')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }

    console.log(`📊 Found ${properties.length} active properties`);

    // Base URLs
    const baseUrl = 'https://salambumi.xyz';
    const currentDate = new Date().toISOString();

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/portfolio', priority: '0.9', changefreq: 'weekly' },
      { url: '/contact', priority: '0.8', changefreq: 'monthly' },
      { url: '/faq', priority: '0.7', changefreq: 'monthly' },
      { url: '/favorites', priority: '0.6', changefreq: 'weekly' },
    ];

    // Generate property URLs
    const propertyUrls = properties.map(property => {
      // Generate SEO-friendly slug
      const slug = generatePropertySlug(property);
      return {
        url: `/${slug}`,
        priority: property.is_premium ? '0.9' : property.is_featured ? '0.8' : '0.7',
        changefreq: 'weekly',
        lastmod: property.updated_at || property.created_at
      };
    });

    // Generate location pages (if you have them)
    const locationUrls = generateLocationUrls(properties);

    // Combine all URLs
    const allUrls = [...staticPages, ...propertyUrls, ...locationUrls];

    // Generate XML sitemap
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${allUrls.map(url => `  <url>
    <loc>${baseUrl}${url.url}</loc>
    <lastmod>${url.lastmod || currentDate}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}

</urlset>`;

    // Write to public directory
    const publicDir = path.join(__dirname, '..', 'client', 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');

    fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');

    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📁 Saved to: ${sitemapPath}`);
    console.log(`📊 Total URLs: ${allUrls.length}`);
    console.log(`🏠 Static pages: ${staticPages.length}`);
    console.log(`🏢 Property pages: ${propertyUrls.length}`);
    console.log(`📍 Location pages: ${locationUrls.length}`);

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
}

function generatePropertySlug(property) {
  // Clean province name
  const cleanProvince = (provinsi) => {
    if (!provinsi) return '';
    return provinsi
      .replace(/^DI\./i, '')
      .replace(/^DAERAH\s+ISTIMEWA\s+/i, '')
      .toLowerCase()
      .trim();
  };

  // Extract key words from title
  const extractKeyWords = (title) => {
    if (!title) return '';
    return title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['dan', 'atau', 'yang', 'di', 'ke', 'dari', 'untuk', 'oleh', 'pada', 'dalam'].includes(word))
      .slice(0, 3)
      .join('-');
  };

  const parts = [
    property.status || 'dijual',
    property.jenis_properti || 'properti',
    cleanProvince(property.provinsi || ''),
    property.kabupaten?.toLowerCase() || '',
    extractKeyWords(property.judul_properti || ''),
    property.kode_listing || ''
  ];

  const cleanedParts = parts.map((part) => {
    if (!part) return '';
    if (parts.indexOf(part) === 5) return part.trim(); // kode_listing

    return part
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }).filter(part => part.length > 0);

  return cleanedParts.join('-');
}

function generateLocationUrls(properties) {
  // Generate location-based URLs
  const locations = new Set();

  properties.forEach(property => {
    if (property.provinsi && property.kabupaten) {
      locations.add(`${property.jenis_properti || 'properti'}-${property.kabupaten.toLowerCase()}`);
    }
  });

  return Array.from(locations).map(location => ({
    url: `/${location}`,
    priority: '0.6',
    changefreq: 'weekly'
  }));
}

// Run the generator
generateSitemap();