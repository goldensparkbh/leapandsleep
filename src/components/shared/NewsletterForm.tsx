import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Loader2 } from 'lucide-react';
import { isValidEmail } from '@/utils/helpers';

interface NewsletterFormProps {
  variant?: 'default' | 'dark' | 'minimal';
  showLabel?: boolean;
  buttonText?: string;
  placeholder?: string;
  onSubmit?: (email: string) => Promise<void>;
  className?: string;
}

export function NewsletterForm({
  variant = 'default',
  showLabel = true,
  buttonText = 'Subscribe',
  placeholder = 'Email address',
  onSubmit,
  className = '',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const isDark = variant === 'dark';
  const isMinimal = variant === 'minimal';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(email);
      }
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSuccess(true);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`flex items-center gap-2 ${isDark ? 'text-[#F6F7F9]' : 'text-[#0B0D10]'}`}>
        <div className="w-6 h-6 rounded-full bg-[#B8B1F5] flex items-center justify-center">
          <Check className="w-4 h-4 text-[#0B0D10]" />
        </div>
        <span className="text-sm font-medium">Thanks for subscribing!</span>
      </div>
    );
  }

  if (isMinimal) {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white border-[rgba(11,13,16,0.08)] rounded-full px-4"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full px-6"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : buttonText}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {showLabel && (
        <label className={`text-sm font-medium ${isDark ? 'text-[#F6F7F9]' : 'text-[#0B0D10]'}`}>
          Get weekly insights
        </label>
      )}
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`flex-1 rounded-full px-4 ${
            isDark 
              ? 'bg-[rgba(246,247,249,0.1)] border-[rgba(246,247,249,0.2)] text-[#F6F7F9] placeholder:text-[#6D727A]' 
              : 'bg-white border-[rgba(11,13,16,0.08)]'
          }`}
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-[#B8B1F5] text-[#0B0D10] hover:bg-[#a59eef] rounded-full px-6"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : buttonText}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </form>
  );
}
