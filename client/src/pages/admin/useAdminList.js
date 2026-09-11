import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi } from "../../lib/api";

/* List state for one admin collection: load, create, update, delete, reorder.

   Reordering is optimistic — the row moves under the cursor immediately and
   the write happens after. A dropped save reverts the list and surfaces the
   error, so the panel never shows an order the database does not have. */

export function useAdminList(resource) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi(`/api/admin/${resource}`);
      if (!alive.current) return;
      setItems(res.items || []);
      setError(null);
    } catch (err) {
      if (alive.current) setError(err);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(
    async (body) => {
      setBusy(true);
      try {
        const res = await adminApi(`/api/admin/${resource}`, { method: "POST", body });
        if (alive.current) setItems((prev) => [...prev, res.item]);
        return res.item;
      } finally {
        if (alive.current) setBusy(false);
      }
    },
    [resource]
  );

  const update = useCallback(
    async (id, body) => {
      setBusy(true);
      try {
        const res = await adminApi(`/api/admin/${resource}/${id}`, { method: "PATCH", body });
        if (alive.current) setItems((prev) => prev.map((i) => (i.id === id ? res.item : i)));
        return res.item;
      } finally {
        if (alive.current) setBusy(false);
      }
    },
    [resource]
  );

  const remove = useCallback(
    async (id) => {
      setBusy(true);
      try {
        await adminApi(`/api/admin/${resource}/${id}`, { method: "DELETE" });
        if (alive.current) setItems((prev) => prev.filter((i) => i.id !== id));
      } finally {
        if (alive.current) setBusy(false);
      }
    },
    [resource]
  );

  /* Writes the new ranking. Dragging updates `items` locally on every frame
     via setItems; this is called once, on drop, so a drag across twenty rows
     is one request rather than twenty.

     `rollback` is the list as it was before the drag started — on failure the
     rows snap back, so the panel never displays an order the database does
     not actually have. */
  const saveOrder = useCallback(
    async (body, rollback) => {
      try {
        await adminApi(`/api/admin/${resource}/reorder`, { method: "POST", body });
        if (alive.current) setError(null);
      } catch (err) {
        if (!alive.current) return;
        if (rollback) setItems(rollback);
        setError(err);
      }
    },
    [resource]
  );

  return { items, setItems, loading, error, setError, busy, reload, create, update, remove, saveOrder };
}
