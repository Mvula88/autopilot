import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Users, 
  MoreVertical,
  Upload,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getClasses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: classes } = await supabase
    .from('classes')
    .select(`
      *,
      students:students(count)
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return classes || []
}

export default async function ClassesPage() {
  const classes = await getClasses()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Manage your classes and student rosters</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/classes/import">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/classes/new">
              <Plus className="mr-2 h-4 w-4" />
              New Class
            </Link>
          </Button>
        </div>
      </div>

      {/* Classes Grid */}
      {classes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <CardDescription>{cls.subject}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Grade Level</span>
                    <Badge variant="secondary">{cls.grade_level || 'Not set'}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Students</span>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{cls.students?.[0]?.count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Year</span>
                    <span>{cls.academic_year || '2024-2025'}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/classes/${cls.id}`}>
                        View Roster
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/classes/${cls.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first class to get started with GradeAssist
            </p>
            <Button asChild>
              <Link href="/classes/new">
                <Plus className="mr-2 h-4 w-4" />
                Create First Class
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}