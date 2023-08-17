'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { sidebarLinks } from '@/constants';
import Image from 'next/image';
import { SignOutButton, SignedIn } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';

function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();
  return (
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          if (link.route === '/profile') link.route = `${link.route}/${userId}`;
          return (
            <Link
              href={link.route}
              key={link.label}
              className={`leftsidebar_link transition-transform  hover:scale-[110%] ${
                isActive && 'bg-primary-500 hover:scale-[100%] cursor-default'
              }`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className=" max-lg:hidden text-light-1">{link.label}</p>
            </Link>
          );
        })}
      </div>
      <div className="mt-10 px-6">
        <SignedIn>
          <SignOutButton signOutCallback={() => router.push('/sign-in')}>
            <div className="flex cursor-pointer gap-4 p-4 transition-transform  hover:scale-[105%]">
              <Image
                src="assets/logout.svg"
                alt="logout"
                width={24}
                height={24}
              />
              <p className="text-light-2 max-lg:hidden ">Logout</p>
            </div>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  );
}

export default LeftSidebar;
