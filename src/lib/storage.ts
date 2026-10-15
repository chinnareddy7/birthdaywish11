const DB_NAME = 'BirthdaySurpriseDB';
const STORE_NAME = 'surprises';

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSurpriseLocally(slug: string, data: any): Promise<void> {
  try {
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const cleanSlug = slug.replace(/^surprise_/, '');
      
      store.put(data, slug);
      store.put(data, cleanSlug);
      store.put(data, `surprise_${cleanSlug}`);
      if (data?.id) {
        store.put(data, String(data.id));
        store.put(data, `surprise_${data.id}`);
      }
      if (data?.slug) {
        store.put(data, data.slug);
        store.put(data, `surprise_${data.slug}`);
      }
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to save to IndexedDB:', error);
  }

  // Backup to localStorage for cross-tab or quick lookup
  try {
    const cleanSlug = slug.replace(/^surprise_/, '');
    const serialized = JSON.stringify(data);
    localStorage.setItem(`surprise_${cleanSlug}`, serialized);
    localStorage.setItem(cleanSlug, serialized);
    if (data?.id) {
      localStorage.setItem(`surprise_${data.id}`, serialized);
    }
  } catch {
    // Quota might be exceeded for large media, handled gracefully by IndexedDB
  }
}

export async function getSurpriseLocally(key: string): Promise<any> {
  if (!key) return null;
  const cleanKey = key.replace(/^surprise_/, '');

  try {
    const db = await initDB();
    // 1. Try direct keys in transaction
    const directResult = await new Promise<any>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result) return resolve(req.result);
        const req2 = store.get(`surprise_${cleanKey}`);
        req2.onsuccess = () => {
          if (req2.result) return resolve(req2.result);
          const req3 = store.get(cleanKey);
          req3.onsuccess = () => resolve(req3.result || null);
          req3.onerror = () => resolve(null);
        };
        req2.onerror = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    });

    if (directResult) return directResult;

    // 2. Scan all entries in IndexedDB to find matching slug or id
    const allResult = await new Promise<any>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        const match = items.find((item: any) => 
          item && (
            item.slug === cleanKey ||
            item.slug === key ||
            String(item.id) === cleanKey ||
            String(item.id) === key
          )
        );
        resolve(match || null);
      };
      req.onerror = () => resolve(null);
    });

    if (allResult) return allResult;
  } catch (error) {
    console.error('Failed to read from IndexedDB:', error);
  }

  // 3. Fallback to localStorage
  try {
    const local = localStorage.getItem(`surprise_${cleanKey}`) || localStorage.getItem(cleanKey) || localStorage.getItem(key);
    if (local) {
      return JSON.parse(local);
    }
  } catch {
    // Ignore JSON parse error
  }

  return null;
}
