#!/usr/bin/env node

/**
 * Database Backup Script for Salam Bumi Property
 * Backs up Supabase PostgreSQL database to Cloudflare R2
 */

import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class DatabaseBackup {
  constructor() {
    this.supabase = null
    this.s3Client = null
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    this.backupDir = path.join(__dirname, '..', 'backups')

    this.init()
  }

  init() {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)

    // Initialize R2 client
    const r2AccountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID
    const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY

    if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey) {
      throw new Error('Missing Cloudflare R2 environment variables')
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    })

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  async backupTables() {
    console.log('🚀 Starting database backup...')

    const tables = [
      'properties',
      'inquiries',
      'admin_users',
      'analytics_events',
      'integrations'
    ]

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      tables: {}
    }

    for (const table of tables) {
      console.log(`📊 Backing up table: ${table}`)

      try {
        const { data, error } = await this.supabase
          .from(table)
          .select('*')

        if (error) {
          console.error(`❌ Error backing up ${table}:`, error.message)
          continue
        }

        backup.tables[table] = data
        console.log(`✅ Backed up ${table}: ${data.length} records`)

      } catch (error) {
        console.error(`❌ Failed to backup ${table}:`, error.message)
      }
    }

    return backup
  }

  async saveToFile(backup) {
    const filename = `backup-${this.timestamp}.json`
    const filepath = path.join(this.backupDir, filename)

    try {
      fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))
      console.log(`💾 Backup saved to: ${filepath}`)
      return filepath
    } catch (error) {
      throw new Error(`Failed to save backup file: ${error.message}`)
    }
  }

  async uploadToR2(filepath) {
    const filename = path.basename(filepath)
    const fileContent = fs.readFileSync(filepath)

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'salam-bumi-backups',
        Key: `database/${filename}`,
        Body: fileContent,
        ContentType: 'application/json',
      })

      await this.s3Client.send(command)
      console.log(`☁️ Backup uploaded to R2: database/${filename}`)

      return `database/${filename}`
    } catch (error) {
      throw new Error(`Failed to upload to R2: ${error.message}`)
    }
  }

  async cleanup(keepDays = 30) {
    try {
      // Clean up local files older than keepDays
      const files = fs.readdirSync(this.backupDir)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - keepDays)

      for (const file of files) {
        const filepath = path.join(this.backupDir, file)
        const stats = fs.statSync(filepath)

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filepath)
          console.log(`🗑️ Cleaned up old backup: ${file}`)
        }
      }
    } catch (error) {
      console.warn('Warning: Failed to cleanup old backups:', error.message)
    }
  }

  async run() {
    try {
      console.log('🗄️ Salam Bumi Property - Database Backup')
      console.log('=====================================')

      // 1. Backup all tables
      const backup = await this.backupTables()

      // 2. Save to local file
      const filepath = await this.saveToFile(backup)

      // 3. Upload to R2
      const r2Key = await this.uploadToR2(filepath)

      // 4. Cleanup old backups
      await this.cleanup()

      console.log('✅ Database backup completed successfully!')
      console.log(`📁 Local file: ${filepath}`)
      console.log(`☁️ R2 storage: ${r2Key}`)
      console.log(`📊 Tables backed up: ${Object.keys(backup.tables).length}`)
      console.log(`📈 Total records: ${Object.values(backup.tables).reduce((sum, records) => sum + records.length, 0)}`)

      return {
        success: true,
        filepath,
        r2Key,
        recordCount: Object.values(backup.tables).reduce((sum, records) => sum + records.length, 0)
      }

    } catch (error) {
      console.error('❌ Database backup failed:', error.message)
      throw error
    }
  }
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const backup = new DatabaseBackup()

  backup.run()
    .then((result) => {
      console.log('\n🎉 Backup completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Backup failed:', error.message)
      process.exit(1)
    })
}

export default DatabaseBackup