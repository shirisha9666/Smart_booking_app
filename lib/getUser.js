import { supabase } from "./supabaseClient";

export async function getCurrentUser(){
    const {data:{user},error}=await supabase.auth.getUser()
    if(error){
        console.error("Get user error:", error.message);
        return null
    }
     return user ?? null;
}