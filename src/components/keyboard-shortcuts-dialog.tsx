'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcuts } from '@/lib/keyboard-shortcuts';
import { Keyboard } from 'lucide-react';

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const { shortcuts } = useKeyboardShortcuts();
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="ml-2" 
          aria-label="Keyboard Shortcuts"
        >
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Use these keyboard shortcuts to navigate Tempo quickly.
          </div>
          <table className="w-full text-sm">
            <tbody>
              {shortcuts.map((shortcut, index) => (
                <tr key={index} className="border-b dark:border-gray-700">
                  <td className="py-2">{shortcut.description}</td>
                  <td className="py-2 text-right">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                      {shortcut.requiresMeta ? (
                        <>
                          <span className="text-xs">⌘</span>
                          {shortcut.requiresShift && <span className="mx-0.5">⇧</span>}
                          {shortcut.key.toUpperCase()}
                        </>
                      ) : (
                        shortcut.key
                      )}
                    </kbd>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}