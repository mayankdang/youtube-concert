package com.springapp.mvc;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * User: rishabh
 * Date: 29/6/15
 * Time: 11:31 PM
 */
public class FilesMacroConverter {
    static HashMap<String,String> macros=new HashMap<String, String>();
    static ArrayList<String> arr=new ArrayList<String>();

    static {
        macros.put("ACK","a");
        macros.put("CLIENT_TIMESTAMP","b");
        macros.put("CLIENT_VERSION","c");
        macros.put("CLOCK_DIFF","d");
        macros.put("CONCERT_CREATED","e");
        macros.put("CONCERT_JOINED","f");
        macros.put("CONCERT_TAG","g");
        macros.put("CONCERT_TAKEN","h");
        macros.put("DIE","i");
        macros.put("I_AM_ALREADY_OWNER","j");
        macros.put("LATEST_JOINEE_CONCERT","k");
        macros.put("LATEST_OWNER_CONCERT","l");
        macros.put("LEAVE_CONCERT","m");
        macros.put("LOAD_VIDEO","n");
        macros.put("NETWORK_DELAY","o");
        macros.put("NO_CONCERT","p");
        macros.put("OWNER_DELAY","q");
        macros.put("OWNER_FLAG","r");
        macros.put("PAGE_LOADED","s");
        macros.put("PATCH_CONTENT","t");
        macros.put("PATCH_MAIN","u");
        macros.put("REQUEST_TYPE","v");
        macros.put("RESPONSE_TYPE","w");
        macros.put("SERVER_TIMESTAMP","x");
        macros.put("SYNC_VIDEO","y");
        macros.put("TAB_ID","z");
        macros.put("TAB_UPDATE_LATEST","aa");
        macros.put("USER_ID","ab");
        macros.put("VIDEO_STATE","ac");
        macros.put("VIDEO_TIME","ad");
        macros.put("VIDEO_URL","ae");
        macros.put("VOFFSET","af");

        macros.put("R_ADMIN_PATCH","ag");
        macros.put("R_ADMIN_VERSION_UPDATE","ah");
        macros.put("R_CLOCK_DIFF","ai");
        macros.put("R_CREATE_USER","aj");
        macros.put("R_HANDSHAKING","ak");
        macros.put("R_LEAVE_CONCERT","al");
        macros.put("R_NETWORK_DELAY","am");
        macros.put("R_PAGE_LOADED","an");
        macros.put("R_USER_ONLINE","ao");
        macros.put("R_VIDEO_UPDATE","ap");
        macros.put("AWESOME_DELAY","aq");


        arr.add("AWESOME_DELAY");
        arr.add("R_ADMIN_PATCH");
        arr.add("R_ADMIN_VERSION_UPDATE");
        arr.add("R_CLOCK_DIFF");
        arr.add("R_CREATE_USER");
        arr.add("R_HANDSHAKING");
        arr.add("R_LEAVE_CONCERT");
        arr.add("R_NETWORK_DELAY");
        arr.add("R_PAGE_LOADED");
        arr.add("R_USER_ONLINE");
        arr.add("R_VIDEO_UPDATE");
        arr.add("ACK");
        arr.add("CLIENT_TIMESTAMP");
        arr.add("CLIENT_VERSION");
        arr.add("CLOCK_DIFF");
        arr.add("CONCERT_CREATED");
        arr.add("CONCERT_JOINED");
        arr.add("CONCERT_TAG");
        arr.add("CONCERT_TAKEN");
        arr.add("DIE");
        arr.add("I_AM_ALREADY_OWNER");
        arr.add("LATEST_JOINEE_CONCERT");
        arr.add("LATEST_OWNER_CONCERT");
        arr.add("LEAVE_CONCERT");
        arr.add("LOAD_VIDEO");
        arr.add("NETWORK_DELAY");
        arr.add("NO_CONCERT");
        arr.add("OWNER_DELAY");
        arr.add("OWNER_FLAG");
        arr.add("PAGE_LOADED");
        arr.add("PATCH_CONTENT");
        arr.add("PATCH_MAIN");
        arr.add("REQUEST_TYPE");
        arr.add("RESPONSE_TYPE");
        arr.add("SERVER_TIMESTAMP");
        arr.add("SYNC_VIDEO");
        arr.add("TAB_ID");
        arr.add("TAB_UPDATE_LATEST");
        arr.add("USER_ID");
        arr.add("VIDEO_STATE");
        arr.add("VIDEO_TIME");
        arr.add("VIDEO_URL");
        arr.add("VOFFSET");
    }

    public static void main(String[] args) {
        String files[]={SysProperties.getInstance().getProperty("CONTENTJS_PATH").replace(".js",".build.js"),SysProperties.getInstance().getProperty("MAINJS_PATH").replace(".js",".build.js"),SysProperties.getInstance().getProperty("SERVER_PYTHON_PATH").replace(".py",".build.py")};

        for(String name : files){

            List<String> x=FileUtility.readListFromFile(name);

            String result="";
            for(String i : x){

                for(String p : arr) {
                    if(i.indexOf(p)>-1){
                        i=i.replace(p,macros.get(p));
                    }
                }

                result=result+i+"\n";
            }

            if(name.endsWith(".js")){
                FileUtility.writeFile(name.replace(".js",".live.js"),result);
            }
            else if(name.endsWith(".py")) {
                FileUtility.writeFile(name.replace(".py",".live.py"),result);
            }
        }
    }
}
