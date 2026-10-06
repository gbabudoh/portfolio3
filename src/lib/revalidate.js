import { revalidatePath } from 'next/cache';

// Public pages are statically cached; call after any content mutation so
// changes made in the admin appear on the site immediately.
export function refreshSite() {
  revalidatePath('/', 'layout');
}
