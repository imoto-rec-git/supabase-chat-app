"use client";

import LogoutButton from "@/components/LogoutButton";
import useAuth from "@/hooks/useAuth";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const { session: isLogin } = useAuth();

  return (
    <body>
      <header>
        {isLogin && <LogoutButton />}
        <p>This is the header area</p>
        <hr />
      </header>
      <main>{children}</main>
      <footer>
        <hr />
        <p>This is the footer area</p>
      </footer>
    </body>
  );
};

export default Layout;
