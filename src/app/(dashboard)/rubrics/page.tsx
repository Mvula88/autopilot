import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText,
  Edit,
  Trash2,
  Copy,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getRubrics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: rubrics } = await supabase
    .from('rubrics')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return rubrics || []
}

export default async function RubricsPage() {
  const rubrics = await getRubrics()

  const defaultRubrics = [
    {
      id: 'default-1',
      name: '5-Paragraph Essay Rubric',
      type: 'essay',
      criteria: [
        { name: 'Introduction & Thesis', weight: 20 },
        { name: 'Body Paragraphs', weight: 40 },
        { name: 'Evidence & Analysis', weight: 20 },
        { name: 'Conclusion', weight: 10 },
        { name: 'Grammar & Mechanics', weight: 10 },
      ],
    },
    {
      id: 'default-2',
      name: 'Research Paper Rubric',
      type: 'essay',
      criteria: [
        { name: 'Research & Sources', weight: 25 },
        { name: 'Argument Development', weight: 25 },
        { name: 'Organization', weight: 20 },
        { name: 'Writing Quality', weight: 20 },
        { name: 'Citations & Format', weight: 10 },
      ],
    },
    {
      id: 'default-3',
      name: 'Creative Writing Rubric',
      type: 'essay',
      criteria: [
        { name: 'Creativity & Originality', weight: 30 },
        { name: 'Character Development', weight: 25 },
        { name: 'Plot & Structure', weight: 25 },
        { name: 'Language & Style', weight: 20 },
      ],
    },
  ]

  const allRubrics = [...rubrics, ...defaultRubrics]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rubrics</h1>
          <p className="text-muted-foreground">Create and manage grading rubrics for consistent evaluation</p>
        </div>
        <Button asChild>
          <Link href="/rubrics/new">
            <Plus className="mr-2 h-4 w-4" />
            New Rubric
          </Link>
        </Button>
      </div>

      {/* Rubrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allRubrics.map((rubric) => {
          const isDefault = rubric.id.startsWith('default')
          const totalWeight = rubric.criteria?.reduce((sum: number, c: any) => sum + c.weight, 0) || 0
          
          return (
            <Card key={rubric.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {rubric.name}
                      {isDefault && <Badge variant="secondary">Template</Badge>}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {rubric.type === 'essay' ? 'Essay Rubric' : 'Short Answer Rubric'}
                    </CardDescription>
                  </div>
                  {!isDefault && (
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    {rubric.criteria?.slice(0, 3).map((criterion: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{criterion.name}</span>
                        <Badge variant="outline">{criterion.weight}%</Badge>
                      </div>
                    ))}
                    {rubric.criteria?.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{rubric.criteria.length - 3} more criteria
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Total Weight</span>
                    <Badge variant={totalWeight === 100 ? 'default' : 'destructive'}>
                      {totalWeight}%
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    {isDefault ? (
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/rubrics/new?template=${rubric.id}`}>
                          <Copy className="mr-2 h-4 w-4" />
                          Use Template
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <Link href={`/rubrics/${rubric.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {rubrics.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No custom rubrics yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first rubric or use one of our templates
            </p>
            <Button asChild>
              <Link href="/rubrics/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Rubric
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}