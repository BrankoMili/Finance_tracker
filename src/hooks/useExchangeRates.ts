import { useState, useEffect } from "react";
const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;

export const useExchangeRates = (currency: string) => {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    RSD: 117.0675,
    USD: 1.0345
  });
  const [isExchangesLoading, setIsExchangesLoading] = useState<boolean>(true);
  const [errorExchanges, setErrorExchanges] = useState<Error | null>(null);

  useEffect(() => {
    // Get conversion rate data from API
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsExchangesLoading(true);
        setErrorExchanges(null);
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currency}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.result !== "success") {
          throw new Error(data);
        }

        setExchangeRates(data.conversion_rates);
      } catch (err) {
        if (!controller.signal.aborted) {
          setErrorExchanges(
            err instanceof Error ? err : new Error("Unknown error")
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsExchangesLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [currency]);

  return { exchangeRates, isExchangesLoading, errorExchanges };
};
