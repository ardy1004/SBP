#!/usr/bin/env node

/**
 * Metrics Collection Script
 * Collects and reports application metrics for monitoring
 */

import { createClient } from '@supabase/supabase-js'

class MetricsCollector {
  constructor() {
    this.supabase = null
    this.init()
  }

  init() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables')
      process.exit(1)
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey)
  }

  async collectDailyMetrics() {
    console.log('📊 Collecting daily metrics...')

    try {
      // Property metrics
      const { data: properties, error: propError } = await this.supabase
        .from('properties')
        .select('id, jenis_properti, created_at, is_sold')
        .order('created_at', { ascending: false })

      if (propError) {
        console.error('❌ Error fetching properties:', propError.message)
        return null
      }

      // Inquiry metrics
      const { data: inquiries, error: inqError } = await this.supabase
        .from('inquiries')
        .select('id, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (inqError) {
        console.error('❌ Error fetching inquiries:', inqError.message)
        return null
      }

      // Analytics events
      const { data: events, error: eventError } = await this.supabase
        .from('analytics_events')
        .select('event_type, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (eventError) {
        console.error('❌ Error fetching events:', eventError.message)
        return null
      }

      const metrics = {
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        properties: {
          total: properties.length,
          by_type: this.groupByType(properties),
          new_today: properties.filter(p =>
            new Date(p.created_at).toDateString() === new Date().toDateString()
          ).length,
          sold_this_month: properties.filter(p =>
            p.is_sold && new Date(p.created_at).getMonth() === new Date().getMonth()
          ).length
        },
        inquiries: {
          total_today: inquiries.length,
          conversion_rate: inquiries.length / Math.max(properties.length, 1)
        },
        engagement: {
          total_events: events.length,
          by_type: this.groupByType(events, 'event_type')
        },
        health: {
          database_status: 'healthy',
          last_updated: new Date().toISOString()
        }
      }

      console.log('📈 Daily Metrics:', JSON.stringify(metrics, null, 2))
      return metrics

    } catch (error) {
      console.error('❌ Metrics collection error:', error.message)
      return null
    }
  }

  groupByType(items, key = 'jenis_properti') {
    return items.reduce((acc, item) => {
      const type = item[key]
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
  }

  async run() {
    try {
      console.log('🌱 Salam Bumi Property - Metrics Collector')
      console.log('==========================================')

      const metrics = await this.collectDailyMetrics()

      if (metrics) {
        console.log('✅ Metrics collected successfully')

        // TODO: Send to monitoring dashboard
        // await sendToDashboard(metrics)

        return metrics
      } else {
        console.log('❌ Failed to collect metrics')
        return null
      }

    } catch (error) {
      console.error('💥 Metrics collection failed:', error.message)
      throw error
    }
  }
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const collector = new MetricsCollector()
  collector.run()
    .then((result) => {
      console.log('\n✅ Metrics collection completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Metrics collection failed:', error.message)
      process.exit(1)
    })
}

export default MetricsCollector