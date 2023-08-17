'use server';

import { currentUser } from '@clerk/nextjs';
import Thread from '../models/thread.modal';
import User from '../models/user.model';
import { connectToDB } from '../mongoose';
import { revalidatePath } from 'next/cache';
import { fetchUser } from './user.actions';

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    // Calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    // Fetch the posts that have no parents
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: 'author', model: 'User' })
      .populate({
        path: 'children',
        populate: {
          path: 'author',
          model: 'User',
          select: '_id name parentId image',
        },
      });

    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });
    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
  } catch (error: any) {
    throw new Error(
      `An error occurred while fetching threads: ${error.message}`
    );
  }
}

export async function fetchThreadById(id: string) {
  connectToDB();
  try {
    // TODO: Populate community
    const thread = await Thread.findById(id)
      .populate({
        path: 'author',
        model: User,
        select: '_id id name image',
      })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: User,
            select: '_id id name parentId image',
          },
          {
            path: 'children',
            model: Thread,
            populate: {
              path: 'author',
              model: User,
              select: '_id id name parentId image',
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Error fetching thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();
  try {
    // Find original thread by id
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) throw new Error('Thread not found');

    // Create new thread with the comment text
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    // Save new thread
    const savedCommentThread = await commentThread.save();

    originalThread.children.push(savedCommentThread._id);

    // Save original thread
    await originalThread.save();
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to thread: ${error.message}`);
  }
}

export async function addLikeToThread(threadId: string, userId: string) {
  connectToDB();
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  const originalThread = await Thread.findById(threadId);
  if (!originalThread) throw new Error('Thread not found');

  if (!originalThread.likes.includes(userInfo._id)) {
    await Thread.findByIdAndUpdate(threadId, {
      $push: { likes: userInfo._id },
    });
    await originalThread.save();
  } else {
    await Thread.findByIdAndUpdate(threadId, {
      $pull: { likes: userInfo._id },
    }).exec();
  }
}

export async function isLiked(threadId: string) {
  connectToDB();
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  const originalThread = await Thread.findById(threadId);
  if (!originalThread) throw new Error('Thread not found');

  if (originalThread.likes.includes(userInfo._id)) {
    return true;
  }
  return false;
}
