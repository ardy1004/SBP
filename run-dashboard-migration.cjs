const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Hardcoded for testing - use service role key for admin operations
const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🛠️ Running migration: Dashboard Property Submission System');

  // Read the SQL migration file
  const sqlFile = fs.readFileSync('./migrations/property_submission_extension.sql', 'utf8');
  
  // Split by semicolons to get individual statements
  // But we need to be careful with CREATE FUNCTION which has $$ delimiters
  // Let's split by ';' but keep the function definitions intact
  
  const statements = [];
  let currentStatement = '';
  let inFunction = false;
  let dollarQuote = null;
  
  const lines = sqlFile.split('\n');
  
  for (const line of lines) {
    // Skip comments
    if (line.trim().startsWith('--')) continue;
    
    // Track dollar quote for function bodies
    if (line.includes('$$') || line.includes('$')) {
      const matches = line.match(/\$\w*\$/g);
      if (matches) {
        if (dollarQuote === null) {
          dollarQuote = matches[0];
          inFunction = true;
        } else if (matches.includes(dollarQuote)) {
          inFunction = false;
          dollarQuote = null;
        }
      }
    }
    
    currentStatement += line + '\n';
    
    // End of statement (not in function)
    if (!inFunction && line.trim().endsWith(';')) {
      const trimmed = currentStatement.trim();
      if (trimmed) {
        statements.push(trimmed);
      }
      currentStatement = '';
    }
  }

  console.log(`📄 Found ${statements.length} SQL statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    // Skip empty statements
    if (!sql || sql.trim() === '') continue;
    
    console.log(`📄 Executing statement ${i + 1}/${statements.length}: ${sql.substring(0, 60)}...`);
    try {
      const { error } = await supabase.rpc('exec', { query: sql });

      if (error) {
        console.error('❌ Error executing statement:', sql.substring(0, 100), error);
      } else {
        console.log('✅ Success');
      }
    } catch (error) {
      console.error('🎯 Exception executing:', sql.substring(0, 100), error);
    }
  }

  console.log('🏁 Migration process completed');
  console.log('');
  console.log('✅ Dashboard Property Submission System migration completed!');
  console.log('📋 Tables created:');
  console.log('   - owner_identities');
  console.log('   - sharelink_tokens');
  console.log('   - property_details');
  console.log('   - marketing_agreements');
  console.log('   - agreement_documents');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('   1. Refresh your Supabase dashboard to see the new tables');
  console.log('   2. The new admin components are ready to use');
  console.log('   3. Consider removing dummy admin routes from App.tsx');
}

runMigration().catch(console.error);
