// Admin-side read model: analytics summary and content counts.
import { getDatabase } from '@/lib/database';

const count = (db, sql) => db.prepare(sql).get().count;

export function getAnalyticsSummary() {
  const db = getDatabase();

  const engagement = db
    .prepare(
      `SELECT AVG(time_on_page) AS avg_time_on_page,
              AVG(scroll_depth) AS avg_scroll_depth,
              AVG(interactions) AS avg_interactions
       FROM engagement_metrics`
    )
    .get();

  // Daily page views for the last 14 days (zero-filled), for the dashboard trend.
  const dailyRows = db
    .prepare(
      `SELECT DATE(created_at) AS day, COUNT(*) AS views
       FROM page_views
       WHERE created_at >= DATE('now', '-13 days')
       GROUP BY day`
    )
    .all();
  const byDay = new Map(dailyRows.map((r) => [r.day, r.views]));
  const daily = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (13 - i));
    const day = d.toISOString().slice(0, 10);
    return { day, views: byDay.get(day) || 0 };
  });

  return {
    total: {
      pageViews: count(db, 'SELECT COUNT(*) AS count FROM page_views'),
      visitors: count(db, 'SELECT COUNT(*) AS count FROM visitors'),
    },
    today: {
      pageViews: count(db, "SELECT COUNT(*) AS count FROM page_views WHERE DATE(created_at) = DATE('now')"),
      visitors: count(db, "SELECT COUNT(*) AS count FROM visitors WHERE DATE(last_visit) = DATE('now')"),
    },
    week: {
      pageViews: count(db, "SELECT COUNT(*) AS count FROM page_views WHERE created_at >= DATE('now', '-7 days')"),
      visitors: count(db, "SELECT COUNT(*) AS count FROM visitors WHERE last_visit >= DATE('now', '-7 days')"),
    },
    month: {
      pageViews: count(db, "SELECT COUNT(*) AS count FROM page_views WHERE created_at >= DATE('now', 'start of month')"),
      visitors: count(db, "SELECT COUNT(*) AS count FROM visitors WHERE last_visit >= DATE('now', 'start of month')"),
    },
    engagement: {
      avgTimeOnPage: Math.round(engagement.avg_time_on_page || 0),
      avgScrollDepth: Math.round((engagement.avg_scroll_depth || 0) * 100),
      avgInteractions: Math.round(engagement.avg_interactions || 0),
    },
    topPages: db
      .prepare('SELECT page_path, COUNT(*) AS views FROM page_views GROUP BY page_path ORDER BY views DESC LIMIT 5')
      .all(),
    recentVisitors: db
      .prepare(
        'SELECT visitor_id, last_visit, total_visits, total_page_views FROM visitors ORDER BY last_visit DESC LIMIT 10'
      )
      .all(),
    daily,
  };
}

export function getContentCounts() {
  const db = getDatabase();
  return {
    projects: count(db, 'SELECT COUNT(*) AS count FROM projects'),
    featured: count(db, 'SELECT COUNT(*) AS count FROM projects WHERE featured = 1'),
    experience: count(db, 'SELECT COUNT(*) AS count FROM experience'),
    skills: count(db, 'SELECT COUNT(*) AS count FROM skills'),
    messages: count(db, 'SELECT COUNT(*) AS count FROM contact_messages'),
    unread: count(db, 'SELECT COUNT(*) AS count FROM contact_messages WHERE read = 0 OR read IS NULL'),
  };
}

export function getRecentMessages(limit = 5) {
  return getDatabase()
    .prepare('SELECT id, name, email, subject, read, created_at FROM contact_messages ORDER BY created_at DESC LIMIT ?')
    .all(limit);
}
