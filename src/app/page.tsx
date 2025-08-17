import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, CheckCircle, Users, BarChart3, Send, Clock, Mail } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Parent Comm Autopilot</span>
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
            Save <span className="text-primary">5+ Hours Weekly</span> on Parent Updates
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered parent communication platform that automatically generates personalized weekly updates, keeping parents engaged while you focus on teaching.
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
            Everything You Need for Effortless Parent Communication
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Mail className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Weekly Digests</CardTitle>
                <CardDescription>
                  Automatically generate personalized parent updates every week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• AI-powered personalization</li>
                  <li>• Multi-language support</li>
                  <li>• One-click sending</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Send className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Quick Notes</CardTitle>
                <CardDescription>
                  Send instant updates about positive behaviors, concerns, or info
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• AI-suggested messages</li>
                  <li>• Track parent engagement</li>
                  <li>• Instant delivery</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Engagement Analytics</CardTitle>
                <CardDescription>
                  Track parent engagement and optimize your communication strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Open & click rates</li>
                  <li>• Response tracking</li>
                  <li>• Engagement scores</li>
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
                Transform Your Parent Communication
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Clock className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Save 5+ Hours Weekly</h3>
                    <p className="text-gray-600">Automate parent updates while maintaining personal touch</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Users className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Boost Parent Engagement</h3>
                    <p className="text-gray-600">Keep parents informed and involved in their child's education</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Personalized at Scale</h3>
                    <p className="text-gray-600">Send individualized updates to all parents with one click</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">70%</div>
                <div className="text-xl font-semibold mb-4">Parent Engagement</div>
                <p className="text-gray-600">
                  Average parent email open rate, compared to 20% industry standard
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
            Ready to Automate Parent Communication?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teachers saving 5+ hours weekly on parent updates
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">Start Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; 2024 Parent Communication Autopilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}