import React, { useState } from 'react';
import { Search, Book, MessageCircle, Phone, Mail, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'How do I connect with investors?',
    answer: 'You can browse our investor directory and send connection requests. Once an investor accepts, you can start messaging them directly through our platform. To send a request, go to the Investors page, find an investor you\'re interested in, and click "Request Collaboration".'
  },
  {
    question: 'What should I include in my startup profile?',
    answer: 'Your startup profile should include a compelling pitch summary, funding needs, team information, market opportunity, and any traction or metrics that demonstrate your progress. A complete profile increases your chances of getting noticed by investors.'
  },
  {
    question: 'How do I share documents securely?',
    answer: 'You can upload documents to your secure document vault and selectively share them with connected investors. All documents are encrypted and access-controlled. Go to the Documents page, upload your file, and use the share button to control access.'
  },
  {
    question: 'What are collaboration requests?',
    answer: 'Collaboration requests are formal expressions of interest from investors. They indicate that an investor wants to learn more about your startup and potentially discuss investment opportunities. You can accept or decline these requests from your dashboard.'
  },
  {
    question: 'How do I schedule a meeting?',
    answer: 'Investors can schedule meetings with entrepreneurs they are connected with. Go to the Meetings page, click "Schedule Meeting", select the entrepreneur, choose a date and time, and send the invitation. The entrepreneur will receive a notification to accept or decline.'
  },
  {
    question: 'Is there a video calling feature?',
    answer: 'Yes! Once a meeting is scheduled and accepted, you will receive a unique meeting URL. Click "Join Meeting" to start a secure video call directly in your browser - no additional software required.'
  },
  {
    question: 'How do payments work?',
    answer: 'The platform supports mock payments for demonstration purposes. You can deposit funds using test credit card numbers, withdraw funds, and transfer between users. This simulates real investment flows for the demo.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we take security seriously. All passwords are hashed using BCrypt, JWTs are used for authentication, and all API requests require valid tokens. We also support Two-Factor Authentication (2FA) for added security.'
  }
];

export const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate email sending
    setTimeout(() => {
      toast.success('Message sent! Our support team will respond within 24 hours.');
      setFormData({ name: '', email: '', message: '' });
      setSubmitting(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600">Find answers to common questions or get in touch with our support team</p>
      </div>
      
      {/* Search */}
      <div className="max-w-2xl">
        <Input
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startAdornment={<Search size={18} />}
          fullWidth
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick links */}
        <Card>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg mb-4">
              <Book size={24} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Documentation</h2>
            <p className="text-sm text-gray-600 mt-2">
              Browse our detailed documentation and guides
            </p>
            <Button
              variant="outline"
              className="mt-4"
              rightIcon={<ExternalLink size={16} />}
              onClick={() => window.open('https://docs.nexusplatform.com', '_blank')}
            >
              View Docs
            </Button>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg mb-4">
              <MessageCircle size={24} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Live Chat</h2>
            <p className="text-sm text-gray-600 mt-2">
              Chat with our support team in real-time
            </p>
            <Button className="mt-4" onClick={() => toast.info('Live chat is available 9am-5pm EST')}>
              Start Chat
            </Button>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg mb-4">
              <Phone size={24} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Contact Us</h2>
            <p className="text-sm text-gray-600 mt-2">
              Get help via email or phone
            </p>
            <Button
              variant="outline"
              className="mt-4"
              leftIcon={<Mail size={16} />}
              onClick={() => window.location.href = 'mailto:support@nexusplatform.com'}
            >
              Contact Support
            </Button>
          </CardBody>
        </Card>
      </div>
      
      {/* FAQs */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h2>
        </CardHeader>
        <CardBody>
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                  <button
                    className="flex justify-between items-center w-full text-left"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  >
                    <h3 className="text-base font-medium text-gray-900">
                      {faq.question}
                    </h3>
                    {openFaqIndex === index ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </button>
                  
                  {openFaqIndex === index && (
                    <p className="text-gray-600 mt-2 pl-0">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No FAQs match your search criteria</p>
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* Contact form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Still need help?</h2>
          <p className="text-sm text-gray-500 mt-1">Fill out the form below and we'll get back to you</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleContactSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                rows={4}
                placeholder="How can we help you?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Button type="submit" isLoading={submitting}>
                Send Message
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};