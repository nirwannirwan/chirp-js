import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { TRPCError } from "@trpc/server";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/api/helpers/ssgHelper";

import { api } from "~/utils/api";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data, isLoading } = api.posts.getById.useQuery({ id });

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>Failed to load data</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string")
    throw new TRPCError({ code: "NOT_FOUND", message: "Not found" });

  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id
    }
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: true };
};

export default SinglePostPage;
