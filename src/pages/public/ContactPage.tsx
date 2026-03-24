import { useState } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/shared/SEO';
import { useData } from '@/contexts/DataContext';

export function ContactPage() {
  const { siteSettings } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with the LeapAndSleep team. We'd love to hear from you."
      />

      <div className="min-h-screen bg-[#F6F7F9] pt-24 pb-20">
        <div className="w-full px-6 lg:px-10">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#0B0D10] tracking-[-0.02em] mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-[#6D727A] max-w-2xl mx-auto">
              Have a question or suggestion? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#B8B1F5]/20 flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5 text-[#B8B1F5]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B0D10] mb-2">Email</h3>
                <a
                  href="mailto:hello@leapandsleep.com"
                  className="text-[#6D727A] hover:text-[#0B0D10] transition-colors"
                >
                  hello@leapandsleep.com
                </a>
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#B8B1F5]/20 flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-[#B8B1F5]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B0D10] mb-2">Location</h3>
                <p className="text-[#6D727A]">Remote-first team</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#0B0D10] mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {Object.entries(siteSettings.socialLinks)
                    .filter(([, url]) => url)
                    .map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white border border-[rgba(11,13,16,0.08)] flex items-center justify-center text-[#6D727A] hover:text-[#0B0D10] hover:border-[#0B0D10] transition-colors capitalize"
                      >
                        {platform.charAt(0)}
                      </a>
                    ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[28px] p-8 lg:p-12 shadow-[0_18px_50px_rgba(11,13,16,0.10)] border border-[rgba(11,13,16,0.08)]">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#B8B1F5]/20 flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-[#B8B1F5]" />
                    </div>
                    <h3 className="text-2xl font-semibold text-[#0B0D10] mb-2">Message Sent!</h3>
                    <p className="text-[#6D727A]">
                      Thank you for reaching out. We&apos;ll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Your name"
                          required
                          className="bg-[#F6F7F9] border-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="your@email.com"
                          required
                          className="bg-[#F6F7F9] border-0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        placeholder="What's this about?"
                        required
                        className="bg-[#F6F7F9] border-0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Your message..."
                        required
                        rows={6}
                        className="bg-[#F6F7F9] border-0 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full h-12"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
