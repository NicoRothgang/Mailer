import { Suspense } from "react";
import { ConnectionNotifications } from "@/components/connections/connection-notifications";

export default function ConnectionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <ConnectionNotifications />
      </Suspense>
      {children}
    </>
  );
}
