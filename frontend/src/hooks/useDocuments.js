'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchDocuments } from '@/services/api';

/**
 * Loads land documents and auto-refreshes on an interval to pick up
 * background AI processing updates.
 *
 * @param {number} pollInterval - refresh cadence in ms (default 4000)
 * @returns {{ documents: object[], setDocuments: Function, loading: boolean, error: string|null, reload: Function }}
 */
export function useDocuments(pollInterval = 4000) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Subscribe to the backend by polling on an interval. `reload` is async and
    // only calls setState after the fetch resolves, so this never sets state
    // synchronously within the effect body — the rule's actual concern.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- external-system sync (data fetch), setState is deferred past await
    reload();
    const interval = setInterval(reload, pollInterval);
    return () => clearInterval(interval);
  }, [reload, pollInterval]);

  return { documents, setDocuments, loading, error, reload };
}

export default useDocuments;
