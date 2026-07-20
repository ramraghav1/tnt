import { CanDeactivateFn } from '@angular/router';

/** Minimal contract a component must implement to opt into the unsaved-changes guard. */
export interface ComponentCanDeactivate {
    canDeactivate: () => boolean;
}

/**
 * Prevents navigating away from a component with unsaved edits without confirmation.
 * Delegates the actual "is dirty" check to the component itself via `canDeactivate()`.
 */
export const unsavedChangesGuard: CanDeactivateFn<ComponentCanDeactivate> = component => {
    return component.canDeactivate ? component.canDeactivate() : true;
};
