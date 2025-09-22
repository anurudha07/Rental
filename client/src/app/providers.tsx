"use client";

import StoreProvider from "@/state/redux";
import Auth from "./(auth)/authProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      {/* Removed AWS Amplify Authenticator */}
      <Auth>{children}</Auth>
    </StoreProvider>
  );
};

export default Providers;
