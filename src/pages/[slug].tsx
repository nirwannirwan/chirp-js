import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { appRouter } from "~/server/api/root";

import { api } from "~/utils/api";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>No posts yet</div>;

  return (
    <div className="flex flex-col">
      {[...data]?.map((postsData) => (
        <PostView {...postsData} key={postsData.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) return <div>Failed to load user</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36  bg-slate-500 p-4">
          <Image
            src={data.profilePicture}
            alt={`${data.username ?? ""} profile image`}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
            width={128}
            height={128}
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? ""
        }`}</div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { TRPCError } from "@trpc/server";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string")
    throw new TRPCError({ code: "NOT_FOUND", message: "Not found" });

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username
    }
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: true };
};

export default ProfilePage;
