import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";

import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

dayjs.extend(relativeTime);

const CreatePostWizzard = () => {
  const [input, setInput] = useState<string>("");
  const { user } = useUser();
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      }
    }
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="profile image"
        className="h-14 w-14 rounded-full"
        width={58}
        height={58}
      />
      <input
        placeholder="What's on your mind?"
        className="grow bg-transparent outline-none"
        value={input}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();

  if (postLoading) return <LoadingPage />;
  if (!data) return <div>Failed to load posts</div>;

  return (
    <div className="flex flex-col">
      {[...data]?.map((postsData) => (
        <PostView {...postsData} key={postsData.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoading, isSignedIn } = useUser();
  api.posts.getAll.useQuery();

  if (!userLoading) return <div />;

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {!!isSignedIn && <CreatePostWizzard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
