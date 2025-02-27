"use client";

import Layout from "@/components/Layout";
import SignInGithub from "@/components/SignInGithub";
import useAuth from "@/hooks/useAuth";

export default function Home() {
  const { session: isLogin } = useAuth();
  return (
    <Layout>
      {isLogin ? (
        <>
          <h2>チャットアプリ</h2>
          <p>test</p>
        </>
      ) : (
        <>
          <h2>Githubでサインイン</h2>
          <SignInGithub />
        </>
      )}
    </Layout>
  );
}
