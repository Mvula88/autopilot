'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  Clock,
  Eye,
  MousePointer,
  MessageSquare,
  Calendar,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Zap,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week')
  const [selectedClass, setSelectedClass] = useState('all')
  
  // Mock data for demonstration
  const engagementData = {
    overall: 78,
    trend: 12,
    emailOpen: 85,
    emailClick: 42,
    responseRate: 23,
    avgResponseTime: '2.3 hours'
  }

  const parentMetrics = [
    { name: 'Sarah Johnson', student: 'Emma Johnson', engagement: 95, opens: 12, clicks: 8, responses: 4 },
    { name: 'Michael Chen', student: 'Alex Chen', engagement: 88, opens: 11, clicks: 6, responses: 3 },
    { name: 'Maria Garcia', student: 'Sofia Garcia', engagement: 76, opens: 9, clicks: 4, responses: 2 },
    { name: 'James Wilson', student: 'Liam Wilson', engagement: 65, opens: 7, clicks: 2, responses: 1 },
    { name: 'Jennifer Lee', student: 'Olivia Lee', engagement: 58, opens: 5, clicks: 1, responses: 0 }
  ]

  const communicationStats = {
    weekly: { sent: 45, opened: 38, clicked: 17, responded: 8 },
    monthly: { sent: 180, opened: 153, clicked: 72, responded: 34 },
    yearly: { sent: 1620, opened: 1377, clicked: 648, responded: 306 }
  }

  const bestTimes = [
    { day: 'Monday', time: '7:30 PM', rate: 92 },
    { day: 'Sunday', time: '6:00 PM', rate: 88 },
    { day: 'Thursday', time: '8:00 PM', rate: 85 },
    { day: 'Tuesday', time: '7:00 PM', rate: 82 },
    { day: 'Friday', time: '4:00 PM', rate: 78 }
  ]

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getEngagementIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (score >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Parent Engagement Analytics
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                  <Zap className="h-3 w-3 mr-1" />
                  ROI Dashboard
                </Badge>
              </h1>
              <p className="mt-2 text-blue-100">
                Track and prove your communication impact to administrators
              </p>
            </div>
            <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Overall Engagement</p>
                  <p className="text-3xl font-bold">{engagementData.overall}%</p>
                  <p className="text-sm text-green-300 flex items-center gap-1 mt-1">
                    <ArrowUp className="h-3 w-3" />
                    {engagementData.trend}% this month
                  </p>
                </div>
                <Activity className="h-10 w-10 text-white/30" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Email Open Rate</p>
                  <p className="text-3xl font-bold">{engagementData.emailOpen}%</p>
                  <p className="text-sm text-white/70">Industry avg: 23%</p>
                </div>
                <Eye className="h-10 w-10 text-white/30" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Click Rate</p>
                  <p className="text-3xl font-bold">{engagementData.emailClick}%</p>
                  <p className="text-sm text-white/70">Industry avg: 7%</p>
                </div>
                <MousePointer className="h-10 w-10 text-white/30" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Response Time</p>
                  <p className="text-3xl font-bold">{engagementData.avgResponseTime}</p>
                  <p className="text-sm text-green-300">23% faster</p>
                </div>
                <Clock className="h-10 w-10 text-white/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="math">5th Grade Math</SelectItem>
              <SelectItem value="science">6th Grade Science</SelectItem>
              <SelectItem value="english">7th Grade English</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parents">Parent Details</TabsTrigger>
            <TabsTrigger value="patterns">Engagement Patterns</TabsTrigger>
            <TabsTrigger value="roi">ROI Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Communication Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Communication Funnel
                </CardTitle>
                <CardDescription>
                  Track how parents engage with your messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Sent</span>
                      <span className="text-sm text-gray-600">{communicationStats.weekly.sent} messages</span>
                    </div>
                    <Progress value={100} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Opened</span>
                      <span className="text-sm text-gray-600">{communicationStats.weekly.opened} ({Math.round(communicationStats.weekly.opened/communicationStats.weekly.sent*100)}%)</span>
                    </div>
                    <Progress value={84} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Clicked</span>
                      <span className="text-sm text-gray-600">{communicationStats.weekly.clicked} ({Math.round(communicationStats.weekly.clicked/communicationStats.weekly.sent*100)}%)</span>
                    </div>
                    <Progress value={38} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Responded</span>
                      <span className="text-sm text-gray-600">{communicationStats.weekly.responded} ({Math.round(communicationStats.weekly.responded/communicationStats.weekly.sent*100)}%)</span>
                    </div>
                    <Progress value={18} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Send Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Optimal Send Times
                </CardTitle>
                <CardDescription>
                  When parents are most likely to engage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bestTimes.map((time, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gray-100'
                        }`}>
                          <span className={`text-sm font-bold ${index === 0 ? 'text-white' : 'text-gray-600'}`}>
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{time.day} at {time.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={time.rate} className="w-24 h-2" />
                        <span className="text-sm font-medium text-gray-600">{time.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Individual Parent Engagement</CardTitle>
                <CardDescription>
                  Detailed metrics for each parent's engagement level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parentMetrics.map((parent, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{parent.name}</p>
                          <p className="text-sm text-gray-600">Student: {parent.student}</p>
                        </div>
                        <Badge className={getEngagementColor(parent.engagement)}>
                          {getEngagementIcon(parent.engagement)}
                          <span className="ml-1">{parent.engagement}% Engaged</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span>{parent.opens} opens</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MousePointer className="h-4 w-4 text-gray-400" />
                          <span>{parent.clicks} clicks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span>{parent.responses} responses</span>
                        </div>
                      </div>
                      
                      <Progress value={parent.engagement} className="mt-3 h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Engagement Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-10">{day}</span>
                        <Progress value={[65, 78, 82, 85, 72, 45, 88][i]} className="flex-1 h-3" />
                        <span className="text-sm text-gray-600 w-10">{[65, 78, 82, 85, 72, 45, 88][i]}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Message Type Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Weekly Digests</span>
                      </div>
                      <Badge className="bg-green-50 text-green-700">92% open rate</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Quick Notes</span>
                      </div>
                      <Badge className="bg-yellow-50 text-yellow-700">78% open rate</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-pink-600" />
                        <span className="text-sm font-medium">Event Reminders</span>
                      </div>
                      <Badge className="bg-green-50 text-green-700">95% open rate</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Achievements</span>
                      </div>
                      <Badge className="bg-green-50 text-green-700">98% open rate</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-green-800">Time Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-700">5.2 hours/week</p>
                  <p className="text-sm text-green-600 mt-2">≈ $260 saved weekly</p>
                  <p className="text-xs text-gray-600 mt-4">Based on 10 min/message vs 30 sec with AI</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="text-blue-800">Engagement Increase</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-700">+247%</p>
                  <p className="text-sm text-blue-600 mt-2">vs. traditional methods</p>
                  <p className="text-xs text-gray-600 mt-4">3.5x industry average</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="text-purple-800">Parent Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-700">4.8/5.0</p>
                  <p className="text-sm text-purple-600 mt-2">Based on 156 responses</p>
                  <p className="text-xs text-gray-600 mt-4">96% recommend to others</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Administrator Report Summary</CardTitle>
                <CardDescription>
                  Key metrics to share with school leadership
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold mb-3">Impact Highlights</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Parent engagement increased from 23% to 78% (239% improvement)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Average teacher saves 5+ hours per week on communication</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>95% of parents report feeling more connected to classroom</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Compliance with IEP/504 documentation requirements improved 100%</span>
                    </li>
                  </ul>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                  <Download className="mr-2 h-4 w-4" />
                  Generate Full Administrator Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}