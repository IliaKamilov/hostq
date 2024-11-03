import React from "react";

type UseDebounceHook = (value: string, delay: number) => void;

const defaultDelay = 300;

const useDebounce: UseDebounceHook = (value, delay = defaultDelay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
