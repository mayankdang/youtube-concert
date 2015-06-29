package com.springapp.mvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: rishabh
 * Date: 29/6/15
 * Time: 11:31 PM
 */
public class FilesMacroConverter {

    static HashMap<String,String> macros=new HashMap<String, String>();

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
    }

    public static void main(String[] args) {
        String files[]={SysProperties.getInstance().getProperty("CONTENTJS_PATH"),SysProperties.getInstance().getProperty("MAINJS_PATH"),SysProperties.getInstance().getProperty("SERVER_PYTHON_PATH")};

        for(String name : files){

            List<String> x=FileUtility.readListFromFile(name);


            String result="";
            for(String i : x){

                for(Map.Entry<String, String> entry : macros.entrySet()) {
                    if(i.indexOf("\""+entry.getKey()+"\"")>-1){
                        i=i.replace("\""+entry.getKey()+"\"","\""+macros.get(entry.getKey())+"\"");
                    }
                }

                result=result+i+"\n";
            }

            FileUtility.writeFile(name+".live",result);
        }
    }
}
