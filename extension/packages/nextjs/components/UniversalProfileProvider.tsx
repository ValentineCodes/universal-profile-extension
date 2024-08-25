import PropsWithChildren from "react";
import { UniversalProfileProvider as UPProvider } from "~~/contexts/UniversalProfileContext";

export const UniversalProfileProvider = ({ children }: PropsWithChildren) => {
  return <UPProvider>{children}</UPProvider>;
};
