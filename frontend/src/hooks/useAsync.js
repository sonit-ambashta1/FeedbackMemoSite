import { useState, useCallback } from "react";

export default function useAsync(initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFn) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    setData,
    loading,
    error,
    execute,
    setError,
  };
}
