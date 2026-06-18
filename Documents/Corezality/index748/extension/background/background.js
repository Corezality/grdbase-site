/**
 * Index748 — Background Service Worker v2
 */

const API_URL             = "https://web-production-af80c.up.railway.app/v1/listings";
const API_KEY             = "<9N2g60pg!_3>"; // match EXTENSION_API_KEY in Railway
const BATCH_SIZE          = 50;
const FLUSH_INTERVAL_MINS = 5;

let queue = [];

// ── Restore queue from storage on startup ────────────────
chrome.storage.local.get(["queue"], (result) => {
  if (result.queue && result.queue.length > 0) {
    queue = result.queue;
    console.log(`[Index748] Restored ${queue.length} queued listings`);
    updateBadge();
  }
});

function persistQueue() {
  chrome.storage.local.set({ queue });
}

function updateBadge() {
  const label = queue.length === 0 ? "" : queue.length > 99 ? "99+" : String(queue.length);
  chrome.action.setBadgeText({ text: label });
  chrome.action.setBadgeBackgroundColor({ color: "#FFC500" });
}

// ── Receive listings from content scripts ────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === "LISTINGS_CAPTURED") {
    const { listings, platform } = message;
    const existingIds = new Set(queue.map(l => `${l.platform}:${l.listing_id}`));
    let added = 0;

    for (const listing of listings) {
      const key = `${listing.platform}:${listing.listing_id}`;
      if (!existingIds.has(key)) {
        queue.push(listing);
        existingIds.add(key);
        added++;
      }
    }

    persistQueue();
    updateBadge();
    console.log(`[Index748] +${added} from ${platform} — queue: ${queue.length}`);

    // Flush immediately — don't wait for the alarm interval
    flushQueue();

    sendResponse({ ok: true, added });
    return true;
  }

  if (message.type === "GET_STATS") {
    chrome.storage.local.get(["stats", "queue"], (result) => {
      sendResponse({
        queued:     (result.queue || []).length,
        total_sent: result.stats?.total_sent || 0,
        last_flush: result.stats?.last_flush  || null,
      });
    });
    return true;
  }
});

// ── Flush queue to API ───────────────────────────────────
async function flushQueue() {
  if (queue.length === 0) return;

  const batch = queue.splice(0, BATCH_SIZE);
  persistQueue();
  updateBadge();

  console.log(`[Index748] Flushing ${batch.length} listings to API...`);

  try {
    const response = await fetch(API_URL, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key":    API_KEY,
      },
      body:    JSON.stringify({ listings: batch }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[Index748] Sent ${batch.length} — new: ${data.new_count}, updated: ${data.updated_count}`);

      chrome.storage.local.get(["stats"], (result) => {
        const stats = result.stats || { total_sent: 0, last_flush: null };
        stats.total_sent += data.new_count || 0;
        stats.last_flush  = new Date().toISOString();
        chrome.storage.local.set({ stats });
      });

      updateBadge();

    } else {
      console.warn(`[Index748] API error ${response.status}:`, data);
      queue.unshift(...batch);
      persistQueue();
      updateBadge();
    }

  } catch (err) {
    console.warn(`[Index748] Network error — re-queuing:`, err.message);
    queue.unshift(...batch);
    persistQueue();
    updateBadge();
  }
}

// ── Scheduled flush + keepalive ──────────────────────────
chrome.alarms.create("flush",     { periodInMinutes: FLUSH_INTERVAL_MINS });
chrome.alarms.create("keepalive", { periodInMinutes: 0.4 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "flush") flushQueue();
});
