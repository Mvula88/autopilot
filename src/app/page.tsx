import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, CheckCircle, Users, BarChart3, Sparkles, Clock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">GradeAssist</span>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Grade Papers <span className="text-primary">10x Faster</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered grading assistant that helps teachers save time, provide better feedback, and focus on what matters most - teaching.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need to Grade Efficiently
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Quick Grade</CardTitle>
                <CardDescription>
                  Grade multiple choice and short answer questions instantly with answer keys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Automatic scoring</li>
                  <li>• Batch processing</li>
                  <li>• Instant results</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Essay Assistant</CardTitle>
                <CardDescription>
                  AI-powered essay grading with customizable rubrics and detailed feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Rubric-based scoring</li>
                  <li>• AI suggestions</li>
                  <li>• Detailed feedback</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Class Management</CardTitle>
                <CardDescription>
                  Organize classes, manage rosters, and track student progress easily
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Student rosters</li>
                  <li>• Assignment tracking</li>
                  <li>• Progress monitoring</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Save Hours Every Week
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Clock className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Grade 10x Faster</h3>
                    <p className="text-gray-600">Reduce grading time from hours to minutes with AI assistance</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <BarChart3 className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Better Insights</h3>
                    <p className="text-gray-600">Track student progress and identify areas for improvement</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Consistent Grading</h3>
                    <p className="text-gray-600">Ensure fair and consistent grading across all students</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">85%</div>
                <div className="text-xl font-semibold mb-4">Time Saved</div>
                <p className="text-gray-600">
                  Teachers using GradeAssist report saving an average of 85% of their grading time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Grading?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teachers who are already saving time with GradeAssist
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">Start Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; 2024 GradeAssist. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}