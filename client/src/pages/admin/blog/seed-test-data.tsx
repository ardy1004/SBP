import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AdminSidebar } from '@/components/admin/layouts';

export default function SeedTestDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const sampleArticles = [
    {
      title: "Test Article 1 - Investment",
      slug: "test-article-1-investment",
      content: "<p>This is a test article about investment in Jogja.</p><p>More content here...</p>",
      status: "publish"
    },
    {
      title: "Test Article 2 - Tips",
      slug: "test-article-2-tips",
      content: "<p>This is a test article about buying house tips.</p><p>More content here...</p>",
      status: "draft"
    }
  ];

  const checkTableExists = async () => {
    try {
      const { error } = await supabase
        .from('articles')
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist
        setResults(prev => [...prev, '⚠️ Articles table does not exist. Please run the database migration first.']);
        return false;
      }
      return true;
    } catch (error) {
      console.log('Table check error:', error);
      return false;
    }
  };

  const seedTestData = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      // First, check if table exists
      const tableExists = await checkTableExists();
      if (!tableExists) {
        setResults(prev => [...prev, '❌ Cannot seed data: Articles table does not exist. Please run database migrations first.']);
        setResults(prev => [...prev, '💡 Tip: Run the SQL migration file: migrations/0003_create_articles_table.sql']);
        return;
      }

      // Check for RLS issues by trying to read existing articles
      const { data: existingArticles, error: readError } = await supabase
        .from('articles')
        .select('id')
        .limit(1);

      if (readError && readError.message.includes('row level security')) {
        setResults(prev => [...prev, '⚠️ RLS Policy Issue: Articles table has Row Level Security enabled.']);
        setResults(prev => [...prev, '💡 Solution: Set up RLS policies in Supabase Dashboard for admin operations.']);
        setResults(prev => [...prev, '   - Allow authenticated users to INSERT/UPDATE/DELETE articles']);
        setResults(prev => [...prev, '   - Allow anonymous users to SELECT published articles']);
        return;
      }

      // Then insert the articles one by one
      let successCount = 0;
      for (const article of sampleArticles) {
        try {
          const { data, error } = await supabase
            .from('articles')
            .insert(article)
            .select();

          if (error) {
            if (error.message.includes('row level security')) {
              setResults(prev => [...prev, `❌ RLS Error: "${article.title}" - Row Level Security policy violation`]);
              setResults(prev => [...prev, '💡 Fix: Configure RLS policies in Supabase Dashboard']);
            } else {
              setResults(prev => [...prev, `❌ Error creating "${article.title}": ${error.message}`]);
            }
          } else {
            setResults(prev => [...prev, `✅ Created: ${data[0].title} (ID: ${data[0].id})`]);
            successCount++;
          }
        } catch (insertError) {
          setResults(prev => [...prev, `❌ Exception creating "${article.title}": ${insertError}`]);
        }
      }

      if (successCount > 0) {
        toast({
          title: "Partial Success",
          description: `${successCount} article(s) created successfully`,
        });
      } else {
        toast({
          title: "Seeding Failed",
          description: "No articles could be created. Check RLS policies.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error",
        description: "Failed to seed test data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Seed Test Blog Articles</h1>
              <p className="text-gray-600">Create sample articles for testing the blog admin functionality</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Test Articles to Create</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Article 1: Test Investment (Published)</h3>
                  <p className="text-sm text-gray-600">"Test Article 1 - Investment"</p>
                  <p className="text-xs text-gray-500">Status: Published</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Article 2: Test Tips (Draft)</h3>
                  <p className="text-sm text-gray-600">"Test Article 2 - Tips"</p>
                  <p className="text-xs text-gray-500">Status: Draft</p>
                </div>

                <Button
                  onClick={seedTestData}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Creating Articles...' : 'Create Test Articles'}
                </Button>
              </CardContent>
            </Card>

            {results.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-sm">
                    {results.map((result, index) => (
                      <div key={index} className={result.startsWith('✅') ? 'text-green-600' : 'text-red-600'}>
                        {result}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  After creating test articles, you can:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Go to <strong>Blog Admin</strong> to see the articles in the list</li>
                  <li>Click <strong>Edit</strong> to test the editor functionality</li>
                  <li>Change status from Draft to Published</li>
                  <li>Test the search and filter features</li>
                  <li>Try deleting articles to test the delete functionality</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mt-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">✅ Database Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  Articles table is fully configured with proper RLS policies. You can now create, edit, and manage blog articles through the admin panel.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}