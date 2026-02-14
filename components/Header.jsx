"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LogOut } from "lucide-react";

import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/getUser";

const Header = () => {
  const router = useRouter();
  const [loginUser,setLoginUser]=useState([])

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); 
  };
  const handledashboar = () => {
    router.push("/auth/callback");
  };
  const getUser=async()=>{
    const data=await getCurrentUser()
    setLoginUser(data)
  }

useEffect(()=>{
    getUser()
},[])
 

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={handledashboar}
          >
            <span className="text-2xl font-bold text-indigo-600 ">
              SmartBookMark
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">
              Welcome, {loginUser?.user_metadata?.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
       
        </div>
      </div>
    </header>
  );
};

export default Header;
