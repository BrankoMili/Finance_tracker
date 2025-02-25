import { useState, useEffect, useRef } from "react";

type CacheEntry = {
  rates: Record<string, number>;
  timestamp: number;
};

const CACHE_DURATION = 5 * 60 * 1000;
const cache: Record<string, CacheEntry> = {};

export const useExchangeRates = (currency: string) => {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {}
  );
  const [isExchangesLoading, setIsExchangesLoading] = useState<boolean>(true);
  const [errorExchanges, setErrorExchanges] = useState<Error | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const checkCache = () => {
      const cached = cache[currency];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setExchangeRates(cached.rates);
        setIsExchangesLoading(false);
        return true;
      }
      return false;
    };

    if (checkCache()) return;

    controllerRef.current = new AbortController();
    const fetchData = async () => {
      try {
        setIsExchangesLoading(true);
        setErrorExchanges(null);

        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${currency}`,
          { signal: controllerRef.current!.signal }
        );

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const data = await response.json();
        if (!data.rates) throw new Error("Invalid response");

        cache[currency] = {
          rates: data.rates,
          timestamp: Date.now()
        };

        setExchangeRates(data.rates);
      } catch (err) {
        if (!controllerRef.current?.signal.aborted) {
          setErrorExchanges(
            err instanceof Error ? err : new Error("An error occured")
          );
        }
      } finally {
        if (!controllerRef.current?.signal.aborted) {
          setIsExchangesLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controllerRef.current?.abort();
    };
  }, [currency]);

  return { exchangeRates, isExchangesLoading, errorExchanges };
};
