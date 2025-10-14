import { useState } from "react";

export function useCycle(...args: string[]) {
  const [value, setValue] = useState(args[0]);

  const cycle = () => {
    const index = args.indexOf(value);
    if (index === args.length - 1) {
      setValue(args[0]);
    } else {
      setValue(args[index + 1]);
    }
  };

  return [value, cycle] as const;
}
