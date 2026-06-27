import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts(onOpenHelp: () => void) {
  const navigate = useNavigate();
  const gPressed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      if (e.key === '?') {
        onOpenHelp();
        return;
      }

      if (e.key === 'g') {
        gPressed.current = true;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => { gPressed.current = false; }, 1500);
        return;
      }

      if (gPressed.current) {
        gPressed.current = false;
        if (timer.current) clearTimeout(timer.current);
        const map: Record<string, string> = {
          d: '/', c: '/crm/leads', h: '/hr/employees',
          f: '/finance/invoices', p: '/projects', s: '/support/tickets',
        };
        if (map[e.key]) {
          navigate(map[e.key]);
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate, onOpenHelp]);
}
