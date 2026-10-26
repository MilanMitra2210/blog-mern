import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

export function useTableParams<T extends Record<string, any>>(defaultValues: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const result = { ...defaultValues };
    for (const key in defaultValues) {
      const val = searchParams.get(key);
      if (val !== null) {
        if (typeof defaultValues[key] === "number") {
          result[key] = (Number(val) || defaultValues[key]) as any;
        } else {
          result[key] = val as any;
        }
      }
    }
    return result;
  }, [searchParams, defaultValues]);

  const setParam = useCallback((key: keyof T, value: any) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === undefined || value === null || value === "" || value === defaultValues[key]) {
        next.delete(String(key));
      } else {
        next.set(String(key), String(value));
      }
      if (key !== "page" && "page" in defaultValues) {
        next.delete("page");
      }
      return next;
    }, { replace: true });
  }, [setSearchParams, defaultValues]);

  const setParams = useCallback((newParams: Partial<T>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(newParams)) {
        if (value === undefined || value === null || value === "" || value === defaultValues[key]) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      if (!("page" in newParams) && "page" in defaultValues) {
        next.delete("page");
      }
      return next;
    }, { replace: true });
  }, [setSearchParams, defaultValues]);

  return [params, setParam, setParams] as const;
}
