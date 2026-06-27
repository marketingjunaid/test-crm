import Modal from './Modal';

interface Props { isOpen: boolean; onClose: () => void; }

const shortcuts = [
  { keys: ['?'], label: 'Show this help' },
  { keys: ['g', 'd'], label: 'Go to Dashboard' },
  { keys: ['g', 'h'], label: 'Go to HR' },
  { keys: ['g', 'c'], label: 'Go to CRM' },
  { keys: ['g', 'f'], label: 'Go to Finance' },
  { keys: ['g', 'p'], label: 'Go to Projects' },
  { keys: ['g', 's'], label: 'Go to Support' },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-1">
        {shortcuts.map(s => (
          <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <span className="text-sm text-slate-600">{s.label}</span>
            <div className="flex gap-1">
              {s.keys.map(k => (
                <kbd key={k} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-700">{k}</kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
