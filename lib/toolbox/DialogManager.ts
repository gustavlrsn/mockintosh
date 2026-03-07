/**
 * DialogManager.ts — Macintosh Toolbox Dialog Manager
 *
 * Provides Alert() and ModalDialog() as the public API for showing
 * modal dialogs. These are the modern equivalents of the original
 * Mac Dialog Manager's Alert, NoteAlert, CautionAlert, and ModalDialog.
 *
 * The actual rendering is handled by the DialogApp system app in apps/Dialog.ts.
 * This module provides the programmatic interface that other managers and apps
 * can call without knowing the window/app plumbing.
 *
 * Original Mac routines mapped:
 *   Alert        → Alert()
 *   NoteAlert    → Alert() (no separate icon variants needed)
 *   CautionAlert → Alert()
 *   StopAlert    → Alert()
 *   ModalDialog  → ModalDialog()
 */

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface DialogDef {
  message: string;
  buttons?: string[];
  showInput?: boolean;
  inputDefault?: string;
}

export type ShowDialogFn = (options: DialogDef) => Promise<string | null>;

// -------------------------------------------------------------------------
// DialogManager state — initialized by the OS boot sequence
// -------------------------------------------------------------------------

let _showDialog: ShowDialogFn | null = null;

/**
 * Called once during OS initialization to wire up the dialog display function.
 * This connects the DialogManager to the WindowManager + DialogApp.
 */
export function InitDialogs(showFn: ShowDialogFn): void {
  _showDialog = showFn;
}

// -------------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------------

/**
 * Display a modal alert dialog and wait for the user's response.
 * Returns the label of the button the user clicked.
 *
 * Equivalent to the original Mac Alert/StopAlert/CautionAlert.
 */
export function Alert(
  message: string,
  buttons: string[] = ["OK"]
): Promise<string | null> {
  if (!_showDialog) {
    throw new Error("DialogManager not initialized — call InitDialogs first");
  }
  return _showDialog({ message, buttons });
}

/**
 * Display a modal dialog with optional text input field.
 * Returns the input value (if showInput) or the button label.
 *
 * Equivalent to the original Mac ModalDialog.
 */
export function ModalDialog(def: DialogDef): Promise<string | null> {
  if (!_showDialog) {
    throw new Error("DialogManager not initialized — call InitDialogs first");
  }
  return _showDialog(def);
}
