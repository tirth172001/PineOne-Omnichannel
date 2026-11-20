"use client";

import { useCallback, useEffect, useState } from "react";
import { readStored, writeStored } from "@/lib/storage";
import { type ControlSchema, type ControlValues, defaultValues, randomValues, sanitize } from "./schema";

/**
 * State for a control schema, persisted per prototype in localStorage.
 * Values start at the defaults (same on server and client) and load from storage on mount.
 */
export function useControls<S extends ControlSchema>(namespace: string, schema: S) {
  const [values, setValues] = useState<ControlValues<S>>(() => defaultValues(schema));
  // Saving starts only after a render that already has the loaded values. (A ref set in the load effect let
  // the save effect in the same commit write the defaults over the stored values, and React's development
  // double-run of effects then reloaded those defaults.)
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is client-only, so it must load after mount
    setValues(sanitize(schema, readStored(namespace, "controls", null)));
    setReady(true);
  }, [namespace, schema]);

  useEffect(() => {
    if (ready) writeStored(namespace, "controls", values);
  }, [namespace, values, ready]);

  const set = useCallback(<K extends keyof S>(key: K, value: ControlValues<S>[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);
  const reset = useCallback(() => setValues(defaultValues(schema)), [schema]);
  const randomize = useCallback(() => setValues(randomValues(schema)), [schema]);

  return { schema, values, set, reset, randomize };
}

export type ControlsState<S extends ControlSchema> = ReturnType<typeof useControls<S>>;
