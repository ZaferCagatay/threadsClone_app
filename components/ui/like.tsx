'use client';

import { addLikeToThread, isLiked } from '@/lib/actions/thread.actions';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface Props {
  threadId: string;
  userId: string;
  likes: number;
}

const LikeButton = ({ threadId, userId, likes }: Props) => {
  const [alreadyLiked, setAlreadyLiked] = useState<boolean | null>(null);
  const [likesCount, setLikesCount] = useState<number>(likes);

  // I tryed everything till something worked dont ask me how i did it
  useEffect(() => {
    likedada();
  }, []);

  const likedada = async () => {
    const cenk = await isLiked(threadId);
    setAlreadyLiked(cenk);
  };

  if (alreadyLiked === null) {
    return <div className="text-small-regular text-light-3">...</div>;
  }

  const onSubmit = async () => {
    setAlreadyLiked(!alreadyLiked);
    if (alreadyLiked) {
      setLikesCount(likesCount - 1);
    } else if (!alreadyLiked) {
      setLikesCount(likesCount + 1);
    }
    await addLikeToThread(threadId, userId);
  };

  return (
    <div>
      {alreadyLiked ? (
        <div
          onClick={onSubmit}
          className="flex flex-col items-center justify-center"
        >
          <Image
            src="/assets/heart-filled.svg"
            alt="heart-gray"
            width={24}
            height={24}
            className="cursor-pointer object-contain"
          />
          <p className="text-light-3 text-[13px] cursor-default">
            {likesCount}
          </p>
        </div>
      ) : (
        <div
          onClick={onSubmit}
          className="flex flex-col items-center justify-center"
        >
          <Image
            src="/assets/heart-gray.svg"
            alt="heart-filled"
            width={24}
            height={24}
            className="cursor-pointer object-contain"
          />
          <p className="text-light-3 text-[13px] cursor-default justify-center items-center">
            {likesCount}
          </p>
        </div>
      )}
    </div>
  );
};

export default LikeButton;
