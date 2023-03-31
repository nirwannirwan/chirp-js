import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { PageLayout } from "~/components/layout";

import { api } from "~/utils/api";

const SinglePostPage: NextPage = () => {
  const { isLoaded: userLoading } = useUser();
  api.posts.getAll.useQuery();

  if (!userLoading) return <div />;

  return (
    <>
      <Head>
        <title>Single Post View</title>
      </Head>
      <PageLayout>Post View</PageLayout>
    </>
  );
};

export default SinglePostPage;
