'use server';

import { FilterQuery, SortOrder } from 'mongoose';
import Thread from '../models/thread.modal';
import User from '../models/user.model';
import { connectToDB } from '../mongoose';
import { revalidatePath } from 'next/cache';

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );
    if (path === '/profile/edit') {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();
    return await User.findOne({ id: userId });
    // .populate({
    //   path: 'communities',
    //   module: 'Community'
    // })
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    // Find all threads authored by user with the given id
    const threads = await User.findOne({ id: userId }).populate({
      path: 'threads',
      model: Thread,
      populate: {
        path: 'children',
        model: Thread,
        populate: {
          path: 'author',
          model: User,
          select: 'name image id',
        },
      },
    });

    return threads;
  } catch (error: any) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
}

export async function fetchUsers({
  userId,
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, 'i');

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== '') {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    //Collect all the child thread ids (replies) from the 'children' field
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    const childThreadLikes = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.likes);
    }, []);

    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id',
    });

    const likeReplies = await Thread.find({
      likes: { $in: childThreadLikes },
      author: { $in: userId },
    }).populate({
      path: 'likes',
      model: User,
      select: 'name image _id',
    });

    const likedUserNames = likeReplies.map((thread) => {
      // Exclude the user's own id from the likes array for their own posts
      const likesWithoutOwnId = thread.likes.filter(
        (likedUser: any) => likedUser._id.toString() !== userId.toString()
      );

      const likesInfo = likesWithoutOwnId.map((likedUser: any) => ({
        threadId: thread._id,
        _id: likedUser._id,
        name: likedUser.name,
        image: likedUser.image,
      }));

      return likesInfo;
    });

    return { likedUserNames, replies };
  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}
