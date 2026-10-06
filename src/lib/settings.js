// Key/value site settings editable from the admin (e.g. analytics IDs).
import { getDatabase } from '@/lib/database';

// Only IDs are stored — never raw script — and each is strictly validated because
// it is interpolated into a tracking snippet on every public page.
export const INTEGRATIONS = {
  ga_measurement_id: {
    label: 'Google Analytics 4',
    pattern: /^G-[A-Z0-9]{4,20}$/,
    // Accept either the bare ID or the full gtag snippet pasted from Google.
    extract: (input) => input.toUpperCase().match(/G-[A-Z0-9]{4,20}/)?.[0] || input.trim().toUpperCase(),
    example: 'G-XXXXXXXXXX',
  },
  clarity_project_id: {
    label: 'Microsoft Clarity',
    pattern: /^[a-z0-9]{6,20}$/,
    extract: (input) =>
      input.match(/clarity\.ms\/tag\/([a-z0-9]+)/i)?.[1]?.toLowerCase() ||
      input.match(/"clarity",\s*"script",\s*"([a-z0-9]+)"/i)?.[1]?.toLowerCase() ||
      input.trim().toLowerCase(),
    example: 'ytkd0tb8bx',
  },
};

const DEFAULTS = {
  clarity_project_id: 'ytkd0tb8bx',
};

let ready = false;
function db() {
  const database = getDatabase();
  if (!ready) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const seed = database.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(DEFAULTS)) seed.run(key, value);
    ready = true;
  }
  return database;
}

export function getIntegrationSettings() {
  const rows = db().prepare('SELECT key, value FROM site_settings').all();
  const values = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return Object.fromEntries(
    Object.entries(INTEGRATIONS).map(([key, def]) => {
      const value = values[key] || '';
      // Defence in depth: never hand an invalid value to the page.
      return [key, def.pattern.test(value) ? value : ''];
    })
  );
}

// Returns { values } on success or { errors } keyed by setting.
export function saveIntegrationSettings(input) {
  const errors = {};
  const values = {};
  for (const [key, def] of Object.entries(INTEGRATIONS)) {
    if (!(key in input)) continue;
    const raw = String(input[key] ?? '').trim();
    if (!raw) {
      values[key] = '';
      continue;
    }
    const id = def.extract(raw);
    if (!def.pattern.test(id)) {
      errors[key] = `Enter a valid ${def.label} ID (e.g. ${def.example}).`;
    } else {
      values[key] = id;
    }
  }
  if (Object.keys(errors).length) return { errors };

  const upsert = db().prepare(
    `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
  );
  const save = db().transaction((entries) => entries.forEach(([k, v]) => upsert.run(k, v)));
  save(Object.entries(values));
  return { values: getIntegrationSettings() };
}
