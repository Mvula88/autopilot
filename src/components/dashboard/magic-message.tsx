'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Check, 
  Users, 
  Edit3,
  Copy,
  Mail,
  MessageSquare,
  FileText,
  Clock,
  Zap
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface MagicMessageProps {
  classId?: string
  studentId?: string
  notes?: string[]
}

export default function MagicMessage({ classId, studentId, notes = [] }: MagicMessageProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [messageType, setMessageType] = useState('update')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const messageTypes = [
    { value: 'update', label: 'Weekly Update', icon: Mail },
    { value: 'achievement', label: 'Achievement Recognition', icon: Check },
    { value: 'concern', label: 'Area of Concern', icon: MessageSquare },
    { value: 'event', label: 'Event Reminder', icon: Clock },
    { value: 'iep', label: 'IEP/504 Update', icon: FileText }
  ]

  const templates = {
    iep: [
      'Progress on IEP Goals',
      'Accommodation Update',
      'Quarterly Review',
      'Goal Achievement',
      'Support Strategies'
    ],
    achievement: [
      'Academic Excellence',
      'Behavioral Improvement',
      'Leadership Recognition',
      'Peer Support',
      'Creative Achievement'
    ]
  }

  const generateMessage = async () => {
    setIsGenerating(true)
    
    // Simulate AI generation
    setTimeout(() => {
      let message = ''
      
      if (messageType === 'update') {
        message = `Dear Parents,

I hope this message finds you well! I wanted to share some updates about your child's progress this week.

${notes.length > 0 ? `Key Highlights:\n${notes.map(note => `• ${note}`).join('\n')}` : '• Showed great participation in class discussions\n• Completed all assignments on time\n• Demonstrated strong problem-solving skills'}

Your child continues to show dedication to their learning. They've been particularly engaged during our math lessons and have been helping peers understand challenging concepts.

Areas of Growth:
• Reading comprehension has improved significantly
• More confident presenting in front of the class
• Excellent collaboration with group members

Looking Ahead:
• Next week we'll be starting our science unit on ecosystems
• Please remind your child to bring their project materials by Wednesday
• Parent-teacher conferences are coming up - sign up link will be sent tomorrow

Thank you for your continued support at home. Feel free to reach out if you have any questions!

Best regards,
[Your Name]`
      } else if (messageType === 'achievement') {
        message = `Dear Parents,

I'm excited to share wonderful news about your child's recent achievement!

${selectedTemplate ? `Achievement: ${selectedTemplate}` : 'Outstanding Academic Performance'}

Your child has demonstrated exceptional ${selectedTemplate === 'Academic Excellence' ? 'academic performance' : selectedTemplate === 'Leadership Recognition' ? 'leadership skills' : 'growth'} this week. ${notes.length > 0 ? notes[0] : 'They consistently go above and beyond expectations and serve as a positive role model for their peers.'}

This achievement reflects their hard work, dedication, and positive attitude toward learning. I wanted to make sure you knew about this success so you can celebrate together at home!

Keep up the excellent work!

Warm regards,
[Your Name]`
      } else if (messageType === 'iep') {
        message = `Dear Parents,

This is an update regarding your child's IEP/504 plan progress.

${selectedTemplate ? `Update Type: ${selectedTemplate}` : 'Regular Progress Update'}

Current Progress:
${notes.length > 0 ? notes.map(note => `• ${note}`).join('\n') : `• Meeting current goals as outlined in the plan
• Accommodations are being implemented successfully
• Showing steady progress in targeted areas`}

Accommodations in Use:
• Extended time for assessments (being utilized effectively)
• Preferential seating (helping with focus)
• Break cards (used appropriately when needed)

Next Steps:
• Continue current support strategies
• Monitor progress on specific goals
• Schedule follow-up meeting if needed

Please don't hesitate to reach out if you'd like to discuss your child's progress in more detail.

Best regards,
[Your Name]`
      }
      
      setGeneratedMessage(message)
      setIsGenerating(false)
      setIsDialogOpen(true)
    }, 2000)
  }

  const sendMessage = async () => {
    setIsSending(true)
    
    // Simulate sending
    setTimeout(() => {
      toast({
        title: "Message sent successfully!",
        description: "Parents will receive the update shortly.",
      })
      setIsSending(false)
      setIsDialogOpen(false)
      setGeneratedMessage('')
    }, 1500)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage)
    toast({
      title: "Copied to clipboard",
      description: "Message copied successfully!",
    })
  }

  return (
    <>
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Magic Message Generator
          </CardTitle>
          <CardDescription>
            Generate personalized parent updates with one click using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Message Type</label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {messageTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(messageType === 'iep' || messageType === 'achievement') && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Template {messageType === 'iep' && <Badge className="ml-2 bg-blue-100 text-blue-700">IEP/504 Compliant</Badge>}
              </label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates[messageType as keyof typeof templates]?.map((template) => (
                    <SelectItem key={template} value={template}>
                      {template}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {notes.length > 0 && (
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Recent Notes ({notes.length})
              </p>
              <div className="space-y-1">
                {notes.slice(0, 3).map((note, i) => (
                  <p key={i} className="text-sm text-gray-600">• {note}</p>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={generateMessage}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Magic...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Magic Message
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            Saves ~30 minutes per message
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Generated Message
            </DialogTitle>
            <DialogDescription>
              Review and customize your message before sending
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <Textarea
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Ready to send to {studentId ? '1 parent' : 'all parents'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                ~2 min read
              </Badge>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={copyToClipboard}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit More
            </Button>
            <Button
              onClick={sendMessage}
              disabled={isSending}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Parents
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}