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

/* ------------------------------------------------------------------ CV */

const CV_KEYS = ['cv_url', 'cv_public_id', 'cv_bytes', 'cv_uploaded_at', 'cv_downloads'];

function readKeys(keys) {
  const rows = db()
    .prepare(`SELECT key, value FROM site_settings WHERE key IN (${keys.map(() => '?').join(',')})`)
    .all(...keys);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

function writeKeys(values) {
  const upsert = db().prepare(
    `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
  );
  db().transaction((entries) => entries.forEach(([k, v]) => upsert.run(k, String(v))))(Object.entries(values));
}

// Returns null when no CV has been uploaded.
export function getCv() {
  const v = readKeys(CV_KEYS);
  if (!v.cv_url) return null;
  return {
    url: v.cv_url,
    publicId: v.cv_public_id || '',
    bytes: Number(v.cv_bytes) || 0,
    uploadedAt: v.cv_uploaded_at || null,
    downloads: Number(v.cv_downloads) || 0,
  };
}

export function saveCv({ url, publicId, bytes }) {
  writeKeys({
    cv_url: url,
    cv_public_id: publicId,
    cv_bytes: bytes,
    cv_uploaded_at: new Date().toISOString(),
    cv_downloads: 0,
  });
}

export function clearCv() {
  db()
    .prepare(`DELETE FROM site_settings WHERE key IN (${CV_KEYS.map(() => '?').join(',')})`)
    .run(...CV_KEYS);
}

export function recordCvDownload() {
  db()
    .prepare(
      `UPDATE site_settings SET value = CAST(value AS INTEGER) + 1, updated_at = CURRENT_TIMESTAMP
       WHERE key = 'cv_downloads'`
    )
    .run();
}
