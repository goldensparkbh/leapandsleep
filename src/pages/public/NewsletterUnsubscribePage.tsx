import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, MailCheck, MailX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { unsubscribeNewsletter } from '@/lib/firebase/newsletter';

type UnsubscribeState = 'loading' | 'success' | 'error';

export function NewsletterUnsubscribePage() {
  const [searchParams] = useSearchParams();
  const requestStartedRef = useRef(false);
  const [state, setState] = useState<UnsubscribeState>('loading');
  const [message, setMessage] = useState('Processing your unsubscribe request...');

  useEffect(() => {
    if (requestStartedRef.current) return;
    requestStartedRef.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setState('error');
      setMessage('This unsubscribe link is missing its token.');
      return;
    }

    void (async () => {
      try {
        const result = await unsubscribeNewsletter(token);
        setState('success');
        setMessage(
          result.status === 'already-unsubscribed'
            ? 'This email address is already unsubscribed.'
            : 'You have been unsubscribed from future post emails.'
        );
      } catch (unsubscribeError) {
        setState('error');
        setMessage(
          unsubscribeError instanceof Error
            ? unsubscribeError.message
            : 'This unsubscribe link is invalid or has expired.'
        );
      }
    })();
  }, [searchParams]);

  return (
    <section className="px-6 py-28 lg:px-10">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-[rgba(11,13,16,0.08)] bg-white p-8 text-center shadow-sm lg:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#B8B1F5]/15">
          {state === 'loading' && <Loader2 className="h-7 w-7 animate-spin text-[#0B0D10]" />}
          {state === 'success' && <MailCheck className="h-7 w-7 text-[#0B0D10]" />}
          {state === 'error' && <MailX className="h-7 w-7 text-[#0B0D10]" />}
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-[#0B0D10]">
          {state === 'success' ? 'Subscription updated' : 'Email preferences'}
        </h1>
        <p className="mt-3 text-base text-[#6D727A]">{message}</p>
        <div className="mt-8 flex justify-center">
          <Link to="/">
            <Button className="rounded-full bg-[#0B0D10] px-6 text-white hover:bg-[#1A1D21]">
              Return to homepage
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
