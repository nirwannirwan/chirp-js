import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const { isLoaded: userLoading } = useUser();
  api.posts.getAll.useQuery();

  if (!userLoading) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">Profile View</main>
    </>
  );
};

export default ProfilePage;