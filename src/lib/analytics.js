'use client';

// Analytics functions - no class instantiation during module load
let analyticsState = {
  visitorId: null,
  sessionId: null,
  startTime: Date.now(),
  interactions: 0,
  maxScrollDepth: 0,
  isTracking: false,
  initialized: false,
  lastPageView: 0,
  lastPagePath: null,
  lastEngagement: 0
};

function getOrCreateVisitorId() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  
  let visitorId = localStorage.getItem('portfolio_visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('portfolio_visitor_id', visitorId);
  }
  return visitorId;
}

function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function initialize() {
  if (analyticsState.initialized || typeof window === 'undefined') return;
  
  analyticsState.visitorId = getOrCreateVisitorId();
  analyticsState.sessionId = generateSessionId();
  analyticsState.initialized = true;
}

async function trackPageView(pagePath = window.location.pathname) {
  if (!analyticsState.initialized || !analyticsState.visitorId || !analyticsState.sessionId) return;
  
  // De-duplicate repeat views of the same path within 5 seconds
  const now = Date.now();
  if (pagePath === analyticsState.lastPagePath && now - analyticsState.lastPageView < 5000) return;
  analyticsState.lastPageView = now;
  analyticsState.lastPagePath = pagePath;
  
  try {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'page_view',
        data: {
          page_path: pagePath,
          visitor_id: analyticsState.visitorId,
          session_id: analyticsState.sessionId
        }
      })
    });
    
    if (!response.ok) {
      console.warn('Analytics tracking failed:', response.status);
    }
  } catch (error) {
    console.warn('Error tracking page view:', error.message);
  }
}

async function trackEngagement(pagePath = window.location.pathname, exitPage = false) {
  if (!analyticsState.initialized || !analyticsState.visitorId || !analyticsState.sessionId) return;
  
  // Rate limiting: only track engagement every 30 seconds (unless it's an exit page)
  const now = Date.now();
  if (!exitPage && now - analyticsState.lastEngagement < 30000) return;
  analyticsState.lastEngagement = now;
  
  const timeOnPage = Math.round((Date.now() - analyticsState.startTime) / 1000);
  
  try {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'engagement',
        data: {
          visitor_id: analyticsState.visitorId,
          session_id: analyticsState.sessionId,
          page_path: pagePath,
          time_on_page: timeOnPage,
          scroll_depth: analyticsState.maxScrollDepth,
          interactions: analyticsState.interactions,
          exit_page: exitPage
        }
      })
    });
    
    if (!response.ok) {
      console.warn('Analytics engagement tracking failed:', response.status);
    }
  } catch (error) {
    console.warn('Error tracking engagement:', error.message);
  }
}

function trackInteraction() {
  analyticsState.interactions++;
}

function trackScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollDepth = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
  
  if (scrollDepth > analyticsState.maxScrollDepth) {
    analyticsState.maxScrollDepth = scrollDepth;
  }
}

function startTracking() {
  if (analyticsState.isTracking || typeof window === 'undefined') return;
  
  // Initialize first
  initialize();
  
  if (!analyticsState.initialized) return;
  
  analyticsState.isTracking = true;
  
  // Track initial page view
  trackPageView();
  
  // Track scroll depth
  window.addEventListener('scroll', trackScroll, { passive: true });
  
  // Track interactions
  document.addEventListener('click', trackInteraction);
  document.addEventListener('keydown', trackInteraction);
  
  // Track page unload
  const trackUnload = () => {
    trackEngagement(window.location.pathname, true);
  };
  window.addEventListener('beforeunload', trackUnload);
  
  // Track page visibility change
  const trackVisibilityChange = () => {
    if (document.hidden) {
      trackEngagement(window.location.pathname, false);
    } else {
      analyticsState.startTime = Date.now();
      analyticsState.interactions = 0;
      analyticsState.maxScrollDepth = 0;
    }
  };
  document.addEventListener('visibilitychange', trackVisibilityChange);
  
  // Track engagement every 30 seconds
  setInterval(() => {
    trackEngagement(window.location.pathname, false);
  }, 30000);
}

// Export analytics object
const analytics = {
  initialize,
  startTracking,
  trackPageView,
  trackEngagement,
  trackInteraction,
  trackScroll
};

export default analytics;
