import UserCard from '@/components/cards/UserCard';
import { fetchUser, fetchUsers, getActivity } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Page = async () => {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect('/onboarding');

  // getActivity
  const { likedUserNames, replies } = await getActivity(userInfo._id);

  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>

      <section className="mt-10 flex flex-col gap-5">
        {replies?.length > 0 || likedUserNames?.length ? (
          <>
            <h1 className="text-heading4-medium text-light-2">Likes</h1>
            {likedUserNames.map((activityArray) =>
              activityArray.map((activity: any) => (
                <Link key={activity._id} href={`/thread/${activity.threadId}`}>
                  <article className="activity-card">
                    <Image
                      src={activity.image}
                      alt="Profile Picture"
                      width={20}
                      height={20}
                      className="rounded-full object-cover"
                    />
                    <p className="!text-small-regular text-light-1">
                      <span className="mr-1 text-primary-500">
                        {activity.name}
                        {''}
                      </span>
                      liked your thread
                    </p>
                  </article>
                </Link>
              ))
            )}
            <h1 className="text-heading4-medium text-light-2 mt-5">Replies</h1>
            {replies.map((activity: any) => (
              <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                <article className="activity-card">
                  <Image
                    src={activity.author.image}
                    alt="Profie Picture"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  <p className="!text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500">
                      {activity.author.name}
                      {''}
                    </span>
                    replied to your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3">No activity yet</p>
        )}
      </section>
    </section>
  );
};

export default Page;
