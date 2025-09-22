"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { useGetAuthUserQuery, api } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";
import { useDispatch } from "react-redux";

const Navbar = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const isDashboardPage =
    pathname.includes("/managers") || pathname.includes("/tenants");

  const handleSignOut = async () => {
    try {
      if (typeof window !== "undefined") {
        // Clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Clear cookie
        document.cookie =
          "token=; Max-Age=0; path=/; domain=" + window.location.hostname;
      }

      // Reset RTK Query cache
      dispatch(api.util.resetApiState());

      // Force redirect to landing page
      router.replace("/"); // replace instead of push to avoid going back
    } catch (err) {
      console.error("Error during sign out:", err);
      // fallback redirect
      router.replace("/");
    }
  };

  return (
    <div
      className="fixed top-0 left-0 w-full z-50 shadow-md"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex justify-between items-center w-full py-3 px-4 sm:px-6 lg:px-8 bg-primary-700 text-white">
        <div className="flex items-center gap-4 md:gap-6">
          {isDashboardPage && (
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          )}

          {/* Logo */}
          <Link
            href="/"
            scroll={false}
            className="flex items-center gap-2 md:gap-3"
          >
            <Image src="/logo.svg" alt="Rental Logo" width={24} height={24} />
            <div className="text-xl sm:text-xl ">
              RENT
              <span className="text-secondary-500 font-light hover:text-primary-300">
                AL
              </span>
            </div>
          </Link>

          {/* Dashboard Action */}
          {isDashboardPage && authUser && (
            <Button
              variant="secondary"
              className="hidden md:flex mr-4 bg-black text-white  hover:text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
              onClick={() =>
                router.push(
                  authUser.userRole?.toLowerCase() === "manager"
                    ? "/managers/newproperty"
                    : "/search"
                )
              }
            >
              {authUser.userRole?.toLowerCase() === "manager" ? (
                <>
                  <Plus className="h-4 w-4" />
                  Add New Property
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Properties
                </>
              )}
            </Button>
          )}
        </div>

        {/* Middle text (desktop only) */}
        {!isDashboardPage && (
          <p className="hidden md:block text-primary-200 text-sm">
            Discover your perfect rental apartment with our advanced search
          </p>
        )}

        {/* Right side buttons */}
        <div className="flex items-center gap-3 sm:gap-5">
          {authUser ? (
            <>
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                  <Avatar>
                    <AvatarImage
                      src={authUser.userInfo?.image || "/default-avatar.png"}
                    />
                    <AvatarFallback>
                      <Image
                        src="/default-avatar.png"
                        alt="Default Avatar"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </AvatarFallback>
                  </Avatar>

                  <span className="hidden md:block text-primary-200 text-sm">
                    {authUser.userInfo?.name}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-primary-700 min-w-[160px]">
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-primary-700 hover:text-white font-medium"
                    onClick={() =>
                      router.push(
                        authUser.userRole?.toLowerCase() === "manager"
                          ? "/managers/properties"
                          : "/tenants/favorites",
                        { scroll: false }
                      )
                    }
                  >
                    Go to Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary-200" />
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-primary-700 hover:text-white font-medium"
                    onClick={() =>
                      router.push(
                        `/${authUser.userRole?.toLowerCase()}s/settings`,
                        { scroll: false }
                      )
                    }
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-primary-700 hover:text-white font-medium"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Sign In Button */}
              <Link href="/signin">
                <Button className="rounded-lg border border-white text-white bg-transparent px-4 py-2 text-sm font-medium hover:bg-white hover:text-primary-700 transition-colors">
                  Sign In
                </Button>
              </Link>

              {/* Sign Up Button (modern gradient style) */}
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-black to-gray-700 text-white px-5 py-2 text-sm  hover:from-black hover:to-gray-800 transition-all shadow-lg">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
